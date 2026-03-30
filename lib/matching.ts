export type Profile = {
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

export type Match = Profile & {
  score: number;
};

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birth = new Date(dateOfBirth);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

export function getZodiacSign(dateOfBirth: string): string {
  const parts = dateOfBirth.split("-");
  const month = parseInt(parts[1], 10);
  const day = parseInt(parts[2], 10);

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

export function getZodiacElement(sign: string): string {
  const fire = ["Aries", "Leo", "Sagittarius"];
  const earth = ["Taurus", "Virgo", "Capricorn"];
  const air = ["Gemini", "Libra", "Aquarius"];
  if (fire.includes(sign)) return "Fire";
  if (earth.includes(sign)) return "Earth";
  if (air.includes(sign)) return "Air";
  return "Water";
}

export function areZodiacsCompatible(sign1: string, sign2: string): boolean {
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

export function calculateCompatibilityScore(
  currentUser: Profile,
  candidate: Profile
): number {
  let score = 0;

  // AGE COMPATIBILITY - sliding scale (35 points)
  const currentAge = calculateAge(currentUser.date_of_birth);
  const candidateAge = calculateAge(candidate.date_of_birth);
  const ageDiff = Math.abs(currentAge - candidateAge);

  if (ageDiff === 0) score += 35;
  else if (ageDiff <= 2) score += 30;
  else if (ageDiff <= 5) score += 24;
  else if (ageDiff <= 8) score += 16;
  else if (ageDiff <= 12) score += 8;

  // CONTACT METHOD MATCH (25 points)
  if (currentUser.preferred_contact_method === candidate.preferred_contact_method) {
    score += 25;
  }

  // ZODIAC COMPATIBILITY (30 points)
  const currentSign = getZodiacSign(currentUser.date_of_birth);
  const candidateSign = getZodiacSign(candidate.date_of_birth);

  if (currentSign === candidateSign) {
    score += 30;
  } else if (areZodiacsCompatible(currentSign, candidateSign)) {
    score += 15;
  }

  // PROFILE COMPLETENESS (10 points)
  if (candidate.photo_url) score += 5;
  if (candidate.nickname) score += 5;

  return score; 
}