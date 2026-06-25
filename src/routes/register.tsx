import { createFileRoute, Link, useNavigate, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, User, Truck, UserRound } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/layouts/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth, dashboardPath } from "@/store/auth";
import { supabase } from "@/lib/supabase"; // Import our live client
import type { Role } from "@/types";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — BorlaGo" },
      { name: "description", content: "Create a BorlaGo account as a resident or join as a collector." },
    ],
  }),
  component: RegisterPage,
});

const roles: { value: Exclude<Role, "admin">; label: string; sub: string; icon: typeof User }[] = [
  { value: "user", label: "Resident", sub: "Request pickups", icon: User },
  { value: "collector", label: "Collector", sub: "Earn collecting", icon: Truck },
];

function RegisterPage() {
  const { status, user } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Exclude<Role, "admin">>("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Track network requests

  if (status === "authenticated" && user) {
    return <Navigate to={dashboardPath[user.role]} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);

    // Register user details and save operational role variables into Supabase Metadata
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: role,
          phone: "+233 20 000 0000", // Fallback values
          address: "Accra, Ghana",
        },
      },
    });

    if (error) {
      toast.error("Registration failed", { description: error.message });
      setLoading(false);
      return;
    }

    if (data.user) {
      toast.success("Account created successfully", { 
        description: `Welcome to BorlaGo, ${name.split(" ")[0]}!` 
      });
      
      // Navigate to the user's corresponding dashboard path variant
      navigate({ to: dashboardPath[role], replace: true });
    }

    setLoading(false);
  };

  return (
    <AuthLayout>
      <div className="space-y-1.5">
        <h1 className="font-display text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">Join BorlaGo in under a minute.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5">
        {roles.map((r) => (
          <button
            key={r.value}
            type="button"
            disabled={loading}
            onClick={() => setRole(r.value)}
            className={cn(
              "flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition-colors",
              role === r.value
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/40",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg",
                role === r.value ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              <r.icon className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold">{r.label}</span>
            <span className="text-xs text-muted-foreground">{r.sub}</span>
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <div className="relative">
            <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              id="name" 
              required 
              disabled={loading}
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your name" 
              className="pl-9" 
            />
          </div>
        </div>
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
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              id="password" 
              type="password" 
              required 
              disabled={loading}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Create a password" 
              className="pl-9" 
            />
          </div>
        </div>
        <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : `Create ${role === "user" ? "resident" : "collector"} account`}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}