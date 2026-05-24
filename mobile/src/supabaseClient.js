import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://wdmzxejeyevmualonzfn.supabase.co';
const supabaseAnonKey = 'sb_publishable_plwutJRgdqcN375Pvyligg_IEbcFnPF';

let storage;
if (Platform.OS !== 'web') {
  storage = require('@react-native-async-storage/async-storage').default;
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
