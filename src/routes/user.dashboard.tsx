// src/routes/user.dashboard.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Plus, ArrowUpRight, Scale, Trash2, ShieldCheck, Loader2 } from "lucide-react";
import { UserApp } from "@/layouts/user-app";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/user/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — BorlaGo" }] }),
  component: () => (
    <UserApp>
      <Dashboard />
    </UserApp>
  ),
});

function MetricCard({
  title,
  value,
  desc,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  desc: string;
  icon: typeof Scale;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{title}</p>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-2 font-display text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
    </Card>
  );
}

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");
  const [stats, setStats] = useState({
    totalWeight: 0,
    activePickups: 0,
    ecoPoints: 0,
  });

  // Calculator state
  const [weeklyVolume, setWeeklyVolume] = useState(25);
  const [projectionWeeks, setProjectionWeeks] = useState(4);

  useEffect(() => {
    async function fetchDashboardTelemetry() {
      try {
        // Fetch current authenticated session details
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user?.id) {
          console.warn("Telemetry Sync aborted: No active or valid authentication session found.");
          setLoading(false);
          return;
        }

        // Safely map metadata profiles
        if (user.user_metadata?.first_name) {
          setUserName(user.user_metadata.first_name);
        } else if (user.email) {
          setUserName(user.email.split("@")[0]);
        }

        // Query pickups table using flexible column mapping fallback fields
        const { data: pickups, error } = await supabase
          .from("pickups")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        if (pickups) {
          // Dynamic calculation support handling variable schema naming conventions safely
          const weight = pickups.reduce((acc, curr) => {
            const weightVal = curr.weight_kg ?? curr.total_weight ?? curr.weight ?? 0;
            return acc + (Number(weightVal) || 0);
          }, 0);

          const points = pickups.reduce((acc, curr) => {
            const pointsVal = curr.estimated_eco_points ?? curr.eco_points ?? curr.points ?? 0;
            return acc + (Number(pointsVal) || 0);
          }, 0);

          const active = pickups.filter(p => 
            ["pending", "scheduled", "en-route", "dispatched"].includes(p.status?.toLowerCase())
          ).length;

          setStats({
            totalWeight: weight,
            activePickups: active,
            ecoPoints: points,
          });
        }
      } catch (err: any) {
        console.error("👉 Error building dashboard aggregates:", err);
        // Explicitly logging granular error insights to prevent silent sync crashes
        if (err.message) {
          console.error("Supabase Database message details:", err.message);
        }
        toast.error("Telemetry Sync Interrupted");
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardTelemetry();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium">Loading ecosystem metrics...</p>
      </div>
    );
  }

  const projectedTotalWeight = weeklyVolume * projectionWeeks;
  const projectedPoints = projectedTotalWeight * 10; 
  const nextTierTarget = 1000;
  const progressPercentage = Math.min((projectedPoints / nextTierTarget) * 100, 100);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Moni, ${userName}!`}
        subtitle="Track your ecological footprint and active pickups."
        actions={
          <Button asChild variant="hero">
            <Link to="/user/book-pickup">
              <Plus className="h-4 w-4" /> Book Pickup
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard
          title="Total Diverted"
          value={`${stats.totalWeight} kg`}
          desc="Lifetime weight diverted from landfill runs"
          icon={Scale}
        />
        <MetricCard
          title="Active Runs"
          value={stats.activePickups}
          desc="Pickups currently dispatched or pending"
          icon={Trash2}
        />
        <MetricCard
          title="Eco Score"
          value={`${stats.ecoPoints} pts`}
          desc="Earned token balancing points tier"
          icon={ShieldCheck}
        />
      </div>

      <Card className="p-5 space-y-6">
        <div>
          <h3 className="font-display text-base font-semibold">Eco-Impact Projector</h3>
          <p className="text-xs text-muted-foreground">Adjust projected weekly weights to calculate long-term ecological balance tiers.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Weekly Waste Volume</label>
                <span className="text-primary font-bold">{weeklyVolume} kg</span>
              </div>
              <input
                type="range"
                min="5"
                max="150"
                step="5"
                value={weeklyVolume}
                onChange={(e) => setWeeklyVolume(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <label className="font-medium">Projection Timeline</label>
                <span className="text-primary font-bold">{projectionWeeks} weeks</span>
              </div>
              <input
                type="range"
                min="1"
                max="12"
                step="1"
                value={projectionWeeks}
                onChange={(e) => setProjectionWeeks(Number(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          <div className="bg-muted/40 p-4 rounded-xl flex flex-col justify-between space-y-4">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Diverted Target</p>
                <p className="text-xl font-bold mt-1">{projectedTotalWeight} kg</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Green Points</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">+{projectedPoints} pts</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span>Next Badge Tier Progress</span>
                <span>{projectedPoints} / {nextTierTarget} pts</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-300" 
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-5 flex items-center justify-between border-primary/20 bg-primary/5">
        <div>
          <p className="font-semibold text-sm">Need a bulk evacuation setup?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Schedule standard multi-bin roll-offs or industrial recycling items instantly.</p>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to="/user/book-pickup">
            Request Custom <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </Button>
      </Card>
    </div>
  );
}