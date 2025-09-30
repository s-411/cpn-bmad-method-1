// Main entry point for shared package
export * from './types';
export * from './constants';
export * from './utils';

// Supabase clients
// NOTE: Use createSupabaseBrowser() for client-side operations to prevent multiple auth instances
export { createSupabaseBrowser } from './lib/supabase-browser';
export { createSupabaseServer, createSupabaseServerAdmin } from './lib/supabase-server';