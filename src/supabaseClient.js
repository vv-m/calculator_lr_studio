import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://yjyavkfbdtbcqfwqvlnm.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_qGmINhTVLJyNC_qIBBCTog_lhZOgGhs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
