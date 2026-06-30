import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/lib/env";

let cachedClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createReadOnlyClient() {
  if (cachedClient) {
    return cachedClient;
  }

  const { url, anonKey } = getSupabaseEnv();

  cachedClient = createSupabaseClient(url, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedClient;
}
