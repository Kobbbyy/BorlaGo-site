// src/routes/admin.login.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Portal Secure Gateway — BorlaGo" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: () => <AdminLogin />,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Authenticate credentials against Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;

      if (!authData.user) {
        throw new Error("Could not initialize security context session.");
      }

      // 2. Security Triage Check: Query the profiles table to verify the user has admin role flags
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !profile) {
        await supabase.auth.signOut();
        throw new Error("Access Denied: Administrative profile matching record not found.");
      }

      // Ensure the user's role is strictly marked as 'admin' or 'dispatcher'
      if (profile.role !== "admin" && profile.role !== "dispatcher") {
        await supabase.auth.signOut();
        throw new Error("Access Denied: This account lacks necessary elevated permissions.");
      }

      toast.success("Identity verified. Welcome to operational control.");
      
      // Redirect straight to our newly created live dashboard route
      navigate({ to: "/admin/dashboard" });
    } catch (err: any) {
      console.error("🔒 Admin Portal Authentication Breach/Failure:", err);
      setErrorMsg(err.message || "An unexpected validation exception occurred.");
      toast.error("Authentication security lock triggered");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md ring-8 ring-primary/10">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">
            BorlaGo Control Center
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Authorized logistics and dispatch management access point.
          </p>
        </div>

        <Card className="p-6 shadow-xl border-border/60 bg-card">
          <form onSubmit={handleAdminSignIn} className="space-y-4">
            {errorMsg && (
              <div className="flex items-start gap-2.5 rounded-xl bg-destructive/10 p-3 text-xs font-medium text-destructive border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Staff Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="name@borlago.com"
                  className="pl-9"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Security Credentials</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground/60" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                "Access Master Console"
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          All connection attempts are cataloged under infrastructure telemetry rules.
        </p>
      </div>
    </div>
  );
}