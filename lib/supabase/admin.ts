import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client that bypasses RLS.
 * Use ONLY in server routes for cross-user read/writes that have
 * already been authorized at the application layer
 *
 * Never import this from client components or middleware in the browser
 * The service role key must NEVER reach or be accessible by the client
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY)
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}
