const requiredEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
};

export function hasSupabaseEnv() {
  return Object.values(requiredEnv).every(Boolean);
}

export function getSupabaseEnv() {
  if (!hasSupabaseEnv()) {
    throw new Error(
      "Supabase environment variables are missing. Fill NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }

  return {
    url: requiredEnv.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: requiredEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  };
}
