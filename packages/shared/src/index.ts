// Main entry point for shared package
export * from './types';
export * from './constants';
export * from './utils';

// Supabase clients
export { supabase, type SupabaseClient } from './lib/supabase';
export { createSupabaseBrowser } from './lib/supabase-browser';
export { createSupabaseServer, createSupabaseServerAdmin } from './lib/supabase-server';