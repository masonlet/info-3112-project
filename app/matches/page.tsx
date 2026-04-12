"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type Profile,
  type Match,
  calculateAge,
  getZodiacSign,
  areZodiacsCompatible,
} from "@/lib/matching";

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revealedContacts, setRevealedContacts] = useState<
    Record<string, { contactMethod: string; contactIdentifier: string }>
  >({});
  const [requestErrors, setRequestErrors] = useState<Record<string, string>>({});
  const [pendingRequests, setPendingRequests] = useState<Record<string, boolean>>({});

  async function handleRequestContactInfo(targetUserId: string) {
    setPendingRequests((prev) => ({ ...prev, [targetUserId]: true }));
    setRequestErrors((prev) => ({ ...prev, [targetUserId]: "" }));

    try {
      const res = await fetch("/api/contact-info/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setRequestErrors((prev) => ({
          ...prev,
          [targetUserId]: data.error ?? "Failed to request contact information.",
        }));
        return;
      }

      setRevealedContacts((prev) => ({
        ...prev,
        [targetUserId]: {
          contactMethod: data.contactMethod,
          contactIdentifier: data.contactIdentifier,
        },
      }));
    } catch {
      setRequestErrors((prev) => ({
        ...prev,
        [targetUserId]: "Network error while requesting contact information.",
      }));
    } finally {
      setPendingRequests((prev) => ({ ...prev, [targetUserId]: false }));
    }
  }

  useEffect(() => {
    async function loadMatches() {
      setLoading(true);
      const res = await fetch("/api/matches");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setMatches(data.matches);
      setCurrentProfile(data.currentProfile);
      setLoading(false);
    }

    loadMatches();
  }, []);

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
            <MatchCard
              key={match.user_id}
              match={match}
              currentUser={currentProfile!}
              revealedContact={revealedContacts[match.user_id]}
              requestError={requestErrors[match.user_id]}
              isRequestPending={pendingRequests[match.user_id] ?? false}
              onRequestContactInfo={handleRequestContactInfo}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

function MatchCard({
  match,
  currentUser,
  revealedContact,
  requestError,
  isRequestPending,
  onRequestContactInfo,
}: {
  match: Match;
  currentUser: Profile;
  revealedContact?: { contactMethod: string; contactIdentifier: string };
  requestError?: string;
  isRequestPending: boolean;
  onRequestContactInfo: (targetUserId: string) => void;
}) {
  const age = calculateAge(match.date_of_birth);
  const currentUserAge = calculateAge(currentUser.date_of_birth);
  const ageDiff = Math.abs(age - currentUserAge);
  const currentSign = getZodiacSign(currentUser.date_of_birth);
  const matchSign = getZodiacSign(match.date_of_birth);

  const displayName = match.nickname
    ? `${match.first_name} "${match.nickname}" ${match.last_name}`
    : `${match.first_name} ${match.last_name}`;

  const reasons: string[] = [];
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

        {revealedContact ? (
          <div className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2">
            <p className="text-xs text-emerald-700">Contact Shared</p>
            <p className="text-sm font-medium text-emerald-900">
              {revealedContact.contactMethod}: {revealedContact.contactIdentifier}
            </p>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={isRequestPending}
            onClick={() => onRequestContactInfo(match.user_id)}
          >
            {isRequestPending ? "Requesting..." : "Request Contact Info"}
          </Button>
        )}

        {requestError && <p className="text-xs text-red-500">{requestError}</p>}
      </CardContent>
    </Card>
  );
}
