export function getFriendlyError(message: string): string {
  const msg = message.toLowerCase();
  if (msg.includes("invalid login credentials")) return "Incorrect email or password. Please try again.";
  if (msg.includes("email not confirmed")) return "Email not verified. Check your inbox, or sign up.";
  return "Something went wrong. Please try again later.";
}
