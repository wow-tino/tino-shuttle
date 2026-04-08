import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";

import { loadServerEnvFiles } from "#/server/load-env";

let cachedClient: SupabaseClient | undefined;

export function getSupabaseServerClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  loadServerEnvFiles();

  const url: string | undefined = process.env.SUPABASE_URL;
  const anonKey: string | undefined = process.env.SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "SUPABASE_URL 또는 SUPABASE_ANON_KEY가 설정되지 않았습니다. .env.development 등을 확인하세요.",
    );
  }

  cachedClient = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return cachedClient;
}
