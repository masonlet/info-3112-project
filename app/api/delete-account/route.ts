import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function DELETE() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("[ERROR] Delete Account Missing Service Role Key.");
    return NextResponse.json(
      { error: "Server configuration error. Please contact an admin." },
      { status: 500 }
    )
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError) console.error("[ERROR] Delete Account Auth:", userError);
  if (userError || !user) return NextResponse.json(
    { error: "Unauthorized" },
    { status: 401 }
  );

  const admin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await admin.auth.admin.deleteUser(user.id);
  if (error) {
    console.error("[ERROR] Delete Account Auth Delete:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
