// src/lib/auth-state.ts
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

// Simple state singleton to hold the active user info
export const authState = {
  user: null as User | null,
  loading: true,
  async checkSession() {
    const { data: { session } } = await supabase.auth.getSession();
    this.user = session?.user ?? null;
    this.loading = false;
    return this.user;
  }
};

// Keep it updated in real-time
supabase.auth.onAuthStateChange((_event, session) => {
  authState.user = session?.user ?? null;
  authState.loading = false;
});