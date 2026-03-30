"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Profile = {
  user_id: string;
  first_name: string;
  last_name: string;
  nickname: string | null;
  gender: string;
  date_of_birth: string;
  member_type: string;
  photo_url: string | null;
  preferred_contact_method: string;
};

type Match = Profile & {
  score: number;
};

function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

function getZodiacSign(dateOfBirth: string): string {
  const date = new Date(dateOfBirth);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return "Aries";
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return "Taurus";
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return "Gemini";
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return "Cancer";
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return "Leo";
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return "Virgo";
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return "Libra";
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return "Scorpio";
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return "Sagittarius";
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return "Capricorn";
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return "Aquarius";
  return "Pisces";
}

function getZodiacElement(sign: string): string {
  const fire = ["Aries", "Leo", "Sagittarius"];
  const earth = ["Taurus", "Virgo", "Capricorn"];
  const air = ["Gemini", "Libra", "Aquarius"];
  if (fire.includes(sign)) return "Fire";
  if (earth.includes(sign)) return "Earth";
  if (air.includes(sign)) return "Air";
  return "Water";
}

function areZodiacsCompatible(sign1: string, sign2: string): boolean {
  const element1 = getZodiacElement(sign1);
  const element2 = getZodiacElement(sign2);

  const compatiblePairs: Record<string, string[]> = {
    Fire: ["Fire", "Air"],
    Earth: ["Earth", "Water"],
    Air: ["Air", "Fire"],
    Water: ["Water", "Earth"],
  };

  return compatiblePairs[element1].includes(element2);
}

function calculateCompatibilityScore(
  currentUser: Profile,
  candidate: Profile
): number {
  let score = 0;

  //GENDER COMPATIBILITY (25 points)
  if (currentUser.gender !== candidate.gender) {
    score += 25;
  } else if (
    currentUser.gender === "Non-Binary" ||
    candidate.gender === "Non-Binary"
  ) {
    score += 12;
  }

  // AGE COMPATIBILITY(25 points)
  const currentAge = calculateAge(currentUser.date_of_birth);
  const candidateAge = calculateAge(candidate.date_of_birth);
  const ageDiff = Math.abs(currentAge - candidateAge);

  if (ageDiff === 0) score += 25;
  else if (ageDiff <= 2) score += 22;
  else if (ageDiff <= 5) score += 18;
  else if (ageDiff <= 8) score += 12;
  else if (ageDiff <= 12) score += 6;

  //CONTACT METHOD MATCH (20 points)
  if (currentUser.preferred_contact_method === candidate.preferred_contact_method) {
    score += 20;
  }

  //ZODIAC COMPATIBILITY (20 points)
  const currentSign = getZodiacSign(currentUser.date_of_birth);
  const candidateSign = getZodiacSign(candidate.date_of_birth);

  if (currentSign === candidateSign) {
    score += 20;
  } else if (areZodiacsCompatible(currentSign, candidateSign)) {
    score += 10;
  }

  //PROFILE COMPLETENESS (10 points)
  if (candidate.photo_url) score += 5;
  if (candidate.nickname) score += 5;

  return score; 
}

export default function MatchesPage() {
  const supabase = createClient();
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaidMember, setIsPaidMember] = useState(false);

  const loadMatches = useCallback(async () => {
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setError("You must be logged in to view matches.");
      setLoading(false);
      return;
    }

    const { data: fetchedProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !fetchedProfile) {
      setError("Please complete your profile before viewing matches.");
      setLoading(false);
      return;
    }

    if (fetchedProfile.member_type !== "Paid") {
      setIsPaidMember(false);
      setLoading(false);
      return;
    }

    setIsPaidMember(true);
    setCurrentProfile(fetchedProfile);

    const { data: candidates, error: candidatesError } = await supabase
      .from("profiles")
      .select("*")
      .eq("member_type", "Paid")
      .neq("user_id", user.id);

    if (candidatesError) {
      setError("Failed to load match recommendations. Please try again.");
      setLoading(false);
      return;
    }

    const scoredMatches: Match[] = (candidates ?? [])
      .map((candidate: Profile) => ({
        ...candidate,
        score: calculateCompatibilityScore(fetchedProfile, candidate),
      }))
      .sort((a: Match, b: Match) => b.score - a.score);

    setMatches(scoredMatches);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  if (loading) {
    return (
      <main className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border">
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">Loading your matches...</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border">
            <CardContent className="py-8">
              <p className="text-sm text-red-500">{error}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (!isPaidMember) {
    return (
      <main className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Match Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">
                Upgrade to a paid membership to view your personalized match recommendations.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  if (matches.length === 0) {
    return (
      <main className="min-h-screen bg-muted/30 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-lg border">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Match Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="py-8">
              <p className="text-sm text-muted-foreground">
                No matches found yet. Check back as more members join!
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/30 py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Your Match Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {matches.length} compatible {matches.length === 1 ? "match" : "matches"} found based on your profile
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {matches.map((match) => (
            <MatchCard key={match.user_id} match={match} currentUser={currentProfile!} />
          ))}
        </div>
      </div>
    </main>
  );
}

function MatchCard({ match, currentUser }: { match: Match; currentUser: Profile }) {
  const age = calculateAge(match.date_of_birth);
  const currentUserAge = calculateAge(currentUser.date_of_birth);
  const ageDiff = Math.abs(age - currentUserAge);
  const currentSign = getZodiacSign(currentUser.date_of_birth);
  const matchSign = getZodiacSign(match.date_of_birth);

  const displayName = match.nickname
    ? `${match.first_name} "${match.nickname}" ${match.last_name}`
    : `${match.first_name} ${match.last_name}`;

  const reasons: string[] = [];
  if (currentUser.gender !== match.gender) reasons.push("Gender match");
  if (ageDiff <= 2) reasons.push("Very close in age");
  else if (ageDiff <= 5) reasons.push("Close in age");
  if (currentUser.preferred_contact_method === match.preferred_contact_method)
    reasons.push(`Both prefer ${match.preferred_contact_method}`);
  if (currentSign === matchSign) reasons.push(`Same sign: ${matchSign}`);
  else if (areZodiacsCompatible(currentSign, matchSign))
    reasons.push(`Compatible signs: ${currentSign} & ${matchSign}`);
  if (match.photo_url) reasons.push("Has photo");
  if (match.nickname) reasons.push("Has nickname");

  return (
    <Card className="shadow-md border hover:shadow-lg transition-shadow">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-4">
          {match.photo_url ? (
            <img
              src={match.photo_url}
              alt={`${match.first_name}'s photo`}
              className="w-16 h-16 rounded-full object-cover border"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center text-2xl font-bold text-muted-foreground border">
              {match.first_name.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-base">{displayName}</p>
            <p className="text-sm text-muted-foreground">
              {age} years old · {match.gender}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Compatibility Score</span>
          <Badge
            variant={
              match.score >= 80
                ? "default"
                : match.score >= 60
                ? "secondary"
                : "outline"
            }
          >
            {match.score >= 80
              ? `Excellent Match · ${match.score}%`
              : match.score >= 60
              ? `Good Match · ${match.score}%`
              : match.score >= 40
              ? `Potential Match · ${match.score}%`
              : `Poor Match · ${match.score}%`}
          </Badge>
        </div>

        {reasons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {reasons.map((reason) => (
              <span
                key={reason}
                className="text-xs bg-muted rounded-full px-3 py-1 text-muted-foreground"
              >
                {reason}
              </span>
            ))}
          </div>
        )}

        <div className="rounded-md bg-muted px-3 py-2">
          <p className="text-xs text-muted-foreground">Preferred Contact</p>
          <p className="text-sm font-medium">{match.preferred_contact_method}</p>
        </div>
      </CardContent>
    </Card>
  );
}