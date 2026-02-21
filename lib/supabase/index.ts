/**
 * Supabase client and utilities.
 * - createClient: Browser/client components
 * - createServerSupabaseClient: Server components, route handlers
 */
export { createClient } from "./client";
export { createServerSupabaseClient } from "./server";
export type { Database, UserRole } from "./database.types";
