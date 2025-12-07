import { createClient } from "@supabase/supabase-js";

export const supabaseBrowser = createClient(
  process.env.NEXT_PUBLIC_SUPERBASE_URL!,
  process.env.NEXT_PUBLIC_SUPERBASE_ANON_KEY!
);
