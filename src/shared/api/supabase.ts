import { createClient } from '@supabase/supabase-js';

import { env } from '@/shared/config/env';

export const supabase =
  env.supabaseUrl && env.supabaseAnonKey
    ? createClient(env.supabaseUrl, env.supabaseAnonKey)
    : null;
