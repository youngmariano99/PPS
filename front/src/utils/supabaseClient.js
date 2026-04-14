import { createClient } from '@supabase/supabase-client';

// Configuración de Supabase (BaaS para autenticación y storage)
const supabaseUrl = 'https://qlciljbuexklxjzxgitk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFsY2lsamJ1ZXhrbHhqenhnaXRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4NzIxNjQsImV4cCI6MjA5MDQ0ODE2NH0.NX038_uwLWXupT21IOUygQlLQwRuT_iSDuti8d1frps';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
