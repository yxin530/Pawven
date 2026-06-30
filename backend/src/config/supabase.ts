import { createClient } from '@supabase/supabase-js';
import { env } from './env';
import WebSocket from 'ws';

// Polyfill WebSocket for Node.js < 22
if (typeof globalThis.WebSocket === 'undefined') {
  (globalThis as any).WebSocket = WebSocket;
}

if (!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
}

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
