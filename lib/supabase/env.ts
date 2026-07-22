const PLACEHOLDER_URL = "https://placeholder.supabase.co";
const PLACEHOLDER_KEY = "placeholder-anon-key";
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

function resolve(name: string, value: string | undefined, placeholder: string) {
  if (value) return value;
  if (process.env.NODE_ENV === "production" && !isBuildPhase) {
    throw new Error(
      `${name} is required in production but is not set.\n` +
        `Configure it in the deployment environment.`,
    );
  }
  return placeholder;
}

export const supabaseUrl = () => resolve(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  PLACEHOLDER_URL
);

export const supabaseKey = () => resolve(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  PLACEHOLDER_KEY,
);
