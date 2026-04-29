export function getFriendlyError(message: string): string {
  const msg = message.toLowerCase();
  // Login Errors
  if (msg.includes("invalid login credentials")) return "Incorrect email or password. Please try again.";
  if (msg.includes("email not confirmed")) return "Email not verified. Check your inbox, or sign up.";

  // Reauthentication & OTP Errors
  if (msg.includes("invalid nonce")) return "The verification code is incorrect. Please check your email.";
  if (msg.includes("nonce") || msg.includes("otp") || msg.includes("expired")) return "Code has expired. Please request a new one.";

  // Rate limiting
  if (msg.includes("too many requests") || msg.includes("rate limit") || msg.includes("429"))
    return "Too many attempts. This service is a demo and rate-limiting is extreme, please try again in a few minutes.";

  // Fallback
  return "Something went wrong. Please try again later.";
}
