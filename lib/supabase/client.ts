/**
 * Supabase browser client for Next.js.
 * Use in Client Components only. For Server Components, use createServerSupabaseClient.
 *
 * Security:
 * - Uses anon key only (never service role in browser)
 * - Sessions persisted via cookies; tokens auto-refresh
 * - URL session detection disabled (prevents OAuth callback hijacking)
 *
 * Expo/React Native: Create a separate client with createClient from @supabase/supabase-js
 * and pass { auth: { storage: AsyncStorage } } for mobile session persistence.
 */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}
