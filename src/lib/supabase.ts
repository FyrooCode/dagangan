import { createClient } from '@supabase/supabase-js'

// Ganti URL dan KEY ini dengan yang ada di Dashboard Supabase kamu
// Project Settings > API
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)