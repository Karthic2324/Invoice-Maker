import { createClient } from '@supabase/supabase-js';

// Base project URL (no /rest/v1/ suffix - the client adds that itself)
export const SUPABASE_URL = 'https://qmajwlyfkkhslbruhifb.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_a9FsIsfi8XmhtSfsu4rY5A_D-xAoF3i';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
