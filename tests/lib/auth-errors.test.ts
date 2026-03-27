import { describe, it, expect } from "vitest";
import { getFriendlyError } from "@/lib/auth-errors";

describe("getFriendlyError", () => {
  it("maps invalid credentials", () => {
    expect(getFriendlyError("Invalid login credentials")).toBe(
      "Incorrect email or password. Please try again."
    );
    expect(getFriendlyError("INVALID LOGIN CREDENTIALS")).toBe(
      "Incorrect email or password. Please try again."
    );
  });

  it("maps unconfirmed email", () => {
    expect(getFriendlyError("Email not confirmed")).toBe(
      "Email not verified. Check your inbox, or sign up."
    );
  });

  it("returns generic error for unknown", () => {
    expect(getFriendlyError("MASSIVE ERROR")).toBe(
      "Something went wrong. Please try again later."
    );
    expect(getFriendlyError("")).toBe(
      "Something went wrong. Please try again later."
    );
  });
});
