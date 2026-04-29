import { describe, it, expect } from "vitest";
import {
  validateEmail,
  validatePassword,
  validateContactVisibility,
} from "@/lib/auth/validation";

describe("auth-validation", () => {
  describe("validateEmail", () => {
    it("returns required error", () => {
      expect(validateEmail("")).toBe("Email is required.");
    });

    it("returns invalid format error", () => {
      expect(validateEmail("invalid")).toBe("Enter a valid email.");
    });

    it("accepts valid email", () => {
      expect(validateEmail("test@example.com")).toBeNull();
    });
  });

  describe("validatePassword", () => {
    it("returns required error", () => {
      expect(validatePassword("")).toBe("Password is required.");
    });

    it("rejects short password", () => {
      expect(validatePassword("short")).toBe("Password must be at least 6 characters.");
    });

    it("rejects invalid password", () => {
      expect(validatePassword("abcdef")).toBe("Password needs uppercase, lowercase, and a number.");
    });

    it("accepts valid password", () => {
      expect(validatePassword("Abcdef1")).toBeNull();
    });
  });

  describe("validateContactVisibility", () => {
    it("returns error when visibility is on but identifier is blank", () => {
      expect(validateContactVisibility(true, "   ")).toBe(
        "You must provide a preferred contact method when contact information is shown."
      );
    });

    it("allows blank identifier when visibility is off", () => {
      expect(validateContactVisibility(false, "")).toBeNull();
    });

    it("allows visible contact when identifier is provided", () => {
      expect(validateContactVisibility(true, "user#1234")).toBeNull();
    });
  });
});
