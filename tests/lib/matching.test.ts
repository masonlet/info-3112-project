import {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  vi
} from "vitest";
import {
  calculateAge,
  getZodiacSign,
  getZodiacElement,
  areZodiacsCompatible,
  calculateCompatibilityScore,
} from "@/lib/matching";

const baseProfile = {
  user_id: "1",
  first_name: "Test",
  last_name: "User",
  nickname: null,
  gender: "Male",
  date_of_birth: "2000-06-15",
  member_type: "Paid",
  photo_url: null,
  preferred_contact_method: "Email",
  skills: [],
  desired_skills: [],
  desired_gender: null,
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01"));
});

afterEach(() => {
  vi.useRealTimers();
});

describe("calculateAge", () => {
  it("returns correct age", () => {
    const age = calculateAge("2000-01-01");
    expect(age).toBeGreaterThan(0);
  });

  it("handles birthday not yet reached this year", () => {
    const age = calculateAge("2000-12-31");
    expect(age).toBeGreaterThan(0);
  });
});

describe("getZodiacSign", () => {
  it("returns Aries for March 21", () => {
    expect(getZodiacSign("2000-03-21")).toBe("Aries");
  });

  it("returns Pisces for February 20", () => {
    expect(getZodiacSign("2000-02-20")).toBe("Pisces");
  });

  it("returns Aquarius for January 20", () => {
    expect(getZodiacSign("2000-01-20")).toBe("Aquarius");
  });

  it("returns Capricorn for December 22", () => {
    expect(getZodiacSign("2000-12-22")).toBe("Capricorn");
  });

  it("returns Taurus for April 20", () => {
    expect(getZodiacSign("2000-04-20")).toBe("Taurus");
  });

  it("returns Scorpio for October 23", () => {
    expect(getZodiacSign("2000-10-23")).toBe("Scorpio");
  });

  it("returns Leo for July 23", () => {
    expect(getZodiacSign("2000-07-23")).toBe("Leo");
  });

  it("returns Sagittarius for November 22", () => {
    expect(getZodiacSign("2000-11-22")).toBe("Sagittarius");
  });
});

describe("getZodiacElement", () => {
  it("returns Fire for Aries", () => {
    expect(getZodiacElement("Aries")).toBe("Fire");
  });

  it("returns Fire for Leo", () => {
    expect(getZodiacElement("Leo")).toBe("Fire");
  });

  it("returns Fire for Sagittarius", () => {
    expect(getZodiacElement("Sagittarius")).toBe("Fire");
  });

  it("returns Earth for Taurus", () => {
    expect(getZodiacElement("Taurus")).toBe("Earth");
  });

  it("returns Earth for Virgo", () => {
    expect(getZodiacElement("Virgo")).toBe("Earth");
  });

  it("returns Earth for Capricorn", () => {
    expect(getZodiacElement("Capricorn")).toBe("Earth");
  });

  it("returns Air for Gemini", () => {
    expect(getZodiacElement("Gemini")).toBe("Air");
  });

  it("returns Air for Libra", () => {
    expect(getZodiacElement("Libra")).toBe("Air");
  });

  it("returns Air for Aquarius", () => {
    expect(getZodiacElement("Aquarius")).toBe("Air");
  });

  it("returns Water for Cancer", () => {
    expect(getZodiacElement("Cancer")).toBe("Water");
  });

  it("returns Water for Scorpio", () => {
    expect(getZodiacElement("Scorpio")).toBe("Water");
  });

  it("returns Water for Pisces", () => {
    expect(getZodiacElement("Pisces")).toBe("Water");
  });
});

describe("areZodiacsCompatible", () => {
  it("Fire and Air are compatible", () => {
    expect(areZodiacsCompatible("Aries", "Gemini")).toBe(true);
  });

  it("Earth and Water are compatible", () => {
    expect(areZodiacsCompatible("Taurus", "Cancer")).toBe(true);
  });

  it("Air and Fire are compatible", () => {
    expect(areZodiacsCompatible("Gemini", "Aries")).toBe(true);
  });

  it("Water and Earth are compatible", () => {
    expect(areZodiacsCompatible("Cancer", "Taurus")).toBe(true);
  });

  it("Fire and Water are not compatible", () => {
    expect(areZodiacsCompatible("Aries", "Cancer")).toBe(false);
  });

  it("Earth and Fire are not compatible", () => {
    expect(areZodiacsCompatible("Taurus", "Aries")).toBe(false);
  });

  it("same signs are compatible", () => {
    expect(areZodiacsCompatible("Aries", "Aries")).toBe(true);
  });
});

describe("calculateCompatibilityScore", () => {
  it("returns max score for perfect match", () => {
    const user1 = {
      ...baseProfile,
      date_of_birth: "2000-03-25",
      skills: ["React", "TypeScript", "Node.js"],
      desired_skills: ["Python", "Docker"],
    };
    const user2 = {
      ...baseProfile,
      user_id: "2",
      date_of_birth: "2000-03-25",
      nickname: "nick",
      photo_url: "http://photo.com",
      skills: ["Python", "Docker"],
      desired_skills: ["React", "TypeScript", "Node.js"],
    };
    const score = calculateCompatibilityScore(user1, user2);
    expect(score).toBe(100);
  });

  it("returns less than 100 for incompatible match", () => {
    const user1 = {
      ...baseProfile,
      date_of_birth: "2000-03-25",
      preferred_contact_method: "Email",
      skills: [],
      desired_skills: [],
    };
    const user2 = {
      ...baseProfile,
      user_id: "2",
      date_of_birth: "1980-06-15",
      preferred_contact_method: "Phone",
      nickname: null,
      photo_url: null,
      skills: [],
      desired_skills: [],
    };
    const score = calculateCompatibilityScore(user1, user2);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(100);
  });

  it("same contact method adds 20 points", () => {
    const user1 = { ...baseProfile, preferred_contact_method: "Email", skills: [], desired_skills: [] };
    const user2 = { ...baseProfile, user_id: "2", preferred_contact_method: "Email", skills: [], desired_skills: [] };
    const score1 = calculateCompatibilityScore(user1, user2);

    const user3 = { ...baseProfile, user_id: "3", preferred_contact_method: "Phone", skills: [], desired_skills: [] };
    const score2 = calculateCompatibilityScore(user1, user3);

    expect(score1 - score2).toBe(20);
  });

  it("same zodiac sign scores higher than incompatible", () => {
    const user1 = { ...baseProfile, date_of_birth: "2000-03-25", skills: [], desired_skills: [] };
    const user2 = { ...baseProfile, user_id: "2", date_of_birth: "2000-03-25", skills: [], desired_skills: [] };
    const user3 = { ...baseProfile, user_id: "3", date_of_birth: "2000-06-15", skills: [], desired_skills: [] };

    const score1 = calculateCompatibilityScore(user1, user2);
    const score2 = calculateCompatibilityScore(user1, user3);

    expect(score1).toBeGreaterThan(score2);
  });

  it("same zodiac sign scores higher than compatible", () => {
    const user1 = { ...baseProfile, date_of_birth: "2000-03-25", skills: [], desired_skills: [] };
    const compatible = { ...baseProfile, user_id: "2", date_of_birth: "2000-05-25", skills: [], desired_skills: [] };
    const sameSign = { ...baseProfile, user_id: "3", date_of_birth: "2000-04-10", skills: [], desired_skills: [] };

    const compatibleScore = calculateCompatibilityScore(user1, compatible);
    const sameSignScore = calculateCompatibilityScore(user1, sameSign);

    expect(sameSignScore - compatibleScore).toBe(13);
  });

  it("photo adds 5 points", () => {
    const user1 = { ...baseProfile, skills: [], desired_skills: [] };
    const withPhoto = { ...baseProfile, user_id: "2", photo_url: "http://photo.com", skills: [], desired_skills: [] };
    const withoutPhoto = { ...baseProfile, user_id: "3", photo_url: null, skills: [], desired_skills: [] };

    const score1 = calculateCompatibilityScore(user1, withPhoto);
    const score2 = calculateCompatibilityScore(user1, withoutPhoto);

    expect(score1 - score2).toBe(5);
  });

  it("nickname adds 5 points", () => {
    const user1 = { ...baseProfile, skills: [], desired_skills: [] };
    const withNickname = { ...baseProfile, user_id: "2", nickname: "nick", skills: [], desired_skills: [] };
    const withoutNickname = { ...baseProfile, user_id: "3", nickname: null, skills: [], desired_skills: [] };

    const score1 = calculateCompatibilityScore(user1, withNickname);
    const score2 = calculateCompatibilityScore(user1, withoutNickname);

    expect(score1 - score2).toBe(5);
  });

  it("age diff over 12 years gives 0 age points", () => {
    const user1 = { ...baseProfile, date_of_birth: "2000-01-01", skills: [], desired_skills: [] };
    const user2 = { ...baseProfile, user_id: "2", date_of_birth: "1985-01-01", skills: [], desired_skills: [] };

    const score = calculateCompatibilityScore(user1, user2);
    const scoreWithSameAge = calculateCompatibilityScore(user1, { ...user2, date_of_birth: "2000-01-01" });

    expect(scoreWithSameAge - score).toBe(25);
  });

  it("1 skill overlap adds 7 points", () => {
    const user1 = { ...baseProfile, skills: ["React"], desired_skills: ["Python"] };
    const user2 = { ...baseProfile, user_id: "2", skills: ["Python"], desired_skills: [] };
    const user3 = { ...baseProfile, user_id: "3", skills: [], desired_skills: [] };

    const score1 = calculateCompatibilityScore(user1, user2);
    const score2 = calculateCompatibilityScore(user1, user3);

    expect(score1 - score2).toBe(7);
  });

  it("3 or more skill overlaps adds 20 points", () => {
    const user1 = { ...baseProfile, skills: ["React", "Node.js"], desired_skills: ["Python", "Docker"] };
    const user2 = { ...baseProfile, user_id: "2", skills: ["Python", "Docker"], desired_skills: ["React", "Node.js"] };
    const user3 = { ...baseProfile, user_id: "3", skills: [], desired_skills: [] };

    const score1 = calculateCompatibilityScore(user1, user2);
    const score2 = calculateCompatibilityScore(user1, user3);

    expect(score1 - score2).toBe(20);
  });
});
