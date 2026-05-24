import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdmzxejeyevmualonzfn.supabase.co';
const supabaseAnonKey = 'sb_publishable_plwutJRgdqcN375Pvyligg_IEbcFnPF';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
