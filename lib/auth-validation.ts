export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Email is required.";
  if (!/^\S+@\S+\.\S+$/.test(email)) return "Enter a valid email.";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 6) return "Password must be at least 6 characters.";
  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password))
    return "Password needs uppercase, lowercase, and a number.";
  return null;
}

export function validateContactVisibility(
  showContactInfo: boolean,
  contactIdentifier: string
): string | null {
  if (showContactInfo && !contactIdentifier.trim()) {
    return "You must provide a contact identifier before enabling visibility.";
  }
  return null;
}
