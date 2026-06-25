// src/store/auth.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Account, Role } from "@/types";
import { supabase } from "../lib/supabase"; 

interface AuthState {
  user: Account | null;
  status: "loading" | "authenticated" | "anonymous";
  signOut: () => Promise<void>; 
  refreshUser: () => Promise<void>; // Added to force global state updates instantly
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [status, setStatus] = useState<AuthState["status"]>("loading");

  const mapSupabaseUserToAccount = (sbUser: any): Account => {
    return {
      id: sbUser.id,
      name: sbUser.user_metadata?.full_name || "New BorlaGo User",
      email: sbUser.email || "",
      role: (sbUser.user_metadata?.role as Role) || "user", 
      phone: sbUser.user_metadata?.phone || "+233 20 000 0000",
      address: sbUser.user_metadata?.address || "Accra, Ghana",
    };
  };

  // Pulls fresh user data directly from Supabase Auth server instance
  const refreshUser = async () => {
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    if (freshUser) {
      setUser(mapSupabaseUserToAccount(freshUser));
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(mapSupabaseUserToAccount(session.user));
        setStatus("authenticated");
      } else {
        setStatus("anonymous");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(mapSupabaseUserToAccount(session.user));
        setStatus("authenticated");
      } else {
        setUser(null);
        setStatus("anonymous");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setStatus("loading");
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, status, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const dashboardPath: Record<Role, string> = {
  user: "/user/dashboard",
  collector: "/collector/dashboard",
  admin: "/admin/dashboard",
};