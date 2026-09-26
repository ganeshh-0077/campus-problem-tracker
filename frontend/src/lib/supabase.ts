import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL || 'https://evsvoftcpfjdwstujwbn.supabase.co';
// Cleanly strip trailing /rest/v1 or trailing slashes if present
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2c3ZvZnRjcGZqZHdzdHVqd2JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0MjM3NzUsImV4cCI6MjEwNTk5OTc3NX0.OhpenzmT8VO-voIB1AKXzKtATLHSds42tHsdy0s4zfo';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    !supabaseUrl.includes('your-project-ref') &&
    !supabaseUrl.includes('placeholder') &&
    supabaseAnonKey &&
    !supabaseAnonKey.includes('your-anon-key-placeholder') &&
    !supabaseAnonKey.includes('placeholder-anon-key')
);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
