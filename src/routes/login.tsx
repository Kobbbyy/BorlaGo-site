import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, Truck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth, dashboardPath } from "@/store/auth";
import { supabase } from "@/lib/supabase"; // Import our live client
import type { Role } from "@/types";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — BorlaGo" },
      { name: "description", content: "Sign in to your BorlaGo resident or collector account." },
    ],
  }),
  component: LoginPage,
});

const roles: { value: Exclude<Role, "admin">; label: string; icon: typeof User }[] = [
  { value: "user", label: "Resident", icon: User },
  { value: "collector", label: "Collector", icon: Truck },
];

function LoginPage() {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Exclude<Role, "admin">>("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Track database request

  if (status === "authenticated" && user) {
    return <Navigate to={dashboardPath[user.role]} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);

    // Communicate directly with your live Supabase project
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error("Authentication failed", { description: error.message });
      setLoading(false);
      return;
    }

    if (data.user) {
      // Grab their actual database role profile
      const userRole = data.user.user_metadata?.role || "user";
      
      toast.success("Welcome back", { description: `Successfully signed in.` });
      navigate({ to: dashboardPath[userRole as Role], replace: true });
    }
    
    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to manage your pickups and jobs.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => setRole(r.value)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              role === r.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <r.icon className="h-4 w-4" /> {r.label}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              required
              disabled={loading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              className="pl-9"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <span className="text-xs text-muted-foreground">Forgot?</span>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-9"
            />
          </div>
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : `Sign in as ${role === "user" ? "Resident" : "Collector"}`}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to BorlaGo?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}