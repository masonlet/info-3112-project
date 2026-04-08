import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeMemberType,
  decideContactVisibility
} from "@/lib/contact-permissions";

type RequestPayload = {
  targetUserId?: string;
};

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "You must be logged in to request contact information." },
      { status: 401 }
    );
  }

  const body = (await req.json()) as RequestPayload;
  const targetUserId = body.targetUserId?.trim();

  if (!targetUserId) {
    return NextResponse.json({ error: "targetUserId is required." }, { status: 400 });
  }

  if (targetUserId === user.id) {
    return NextResponse.json(
      { error: "You cannot request your own contact information." },
      { status: 400 }
    );
  }

  const { data: viewerProfile, error: viewerError } = await supabase
    .from("profiles")
    .select("member_type")
    .eq("user_id", user.id)
    .maybeSingle();

  if (viewerError || !viewerProfile) {
    return NextResponse.json(
      { error: "Complete your profile before requesting contact details." },
      { status: 400 }
    );
  }

  const { data: ownerProfile, error: ownerError } = await supabase
    .from("profiles")
    .select("preferred_contact_method, show_contact_info, email, phone, discord, linkedin")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (ownerError || !ownerProfile) {
    return NextResponse.json(
      { error: "Unable to find this member's contact settings." },
      { status: 404 }
    );
  }

  const contactMethod = ownerProfile.preferred_contact_method?.trim() ?? "";
  const contactIdentifier = (() => {
    switch(contactMethod) {
      case "Email": return ownerProfile.email?.trim() ?? "";
      case "Phone": return ownerProfile.phone?.trim() ?? "";
      case "Discord": return ownerProfile.discord?.trim() ?? "";
      case "LinkedIn": return ownerProfile.linkedin?.trim() ?? "";
      default: return "";
    }
  })();

  const decision = decideContactVisibility({
    viewerMemberType: normalizeMemberType(viewerProfile.member_type ?? "Free"),
    ownerShowContactInfo: ownerProfile.show_contact_info ?? false,
    ownerPreferredContactMethod: contactMethod || null,
    ownerContactIdentifier: contactIdentifier || null,
  });

  if (!decision.allowed) {
    return NextResponse.json(
      { error: "This member has not shared contact information." },
      { status: 403 }
    );
  }

  const { error: logError } = await supabase.from("contact_info_exposures").insert({
    viewer_user_id: user.id,
    owner_user_id: targetUserId,
    contact_method: contactMethod,
  });

  if (logError) {
    console.warn("Failed to log contact_info_exposures:", logError.message);
  }

  return NextResponse.json({
    contactMethod,
    contactIdentifier,
  });
}
