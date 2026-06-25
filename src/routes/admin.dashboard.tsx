// src/routes/admin.dashboard.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import {
  Users,
  Truck,
  ClipboardList,
  DollarSign,
  ArrowRight,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { AdminApp } from "@/layouts/admin-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { revenueSeries, wasteSplit } from "@/lib/mock-data"; // Keeping chart seeds for now

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — BorlaGo" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => (
    <AdminApp>
      <AdminDashboard />
    </AdminApp>
  ),
});

interface LivePickup {
  id: string;
  user_id: string;
  scheduled_date: string;
  time_slot: string;
  waste_type: string;
  status: string;
  price?: number;
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    activeUsers: "1,204", // Can be calculated from dynamic profiles count later
    collectorsOnline: "14",
    liveBookingsCount: 0,
    pendingCount: 0,
    revenueToday: 0,
  });
  const [recentPickups, setRecentPickups] = useState<LivePickup[]>([]);

  useEffect(() => {
    async function fetchAdminMetrics() {
      try {
        // Pull all active operational runs from ledger
        const { data, error } = await supabase
          .from("pickups")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        const pickupsList: LivePickup[] = data || [];
        
        // Calculate telemetry metrics out of true data rows
        const live = pickupsList.filter(p => ["pending", "scheduled", "en-route"].includes(p.status)).length;
        const pending = pickupsList.filter(p => p.status === "pending").length;
        
        // Dynamic summary fallback generation assuming baseline GHS/USD metrics per trip run
        const generatedRevenue = pickupsList
          .filter(p => p.status === "completed")
          .reduce((sum, p) => sum + (p.price || 15), 0); 

        setMetrics(prev => ({
          ...prev,
          liveBookingsCount: live,
          pendingCount: pending,
          revenueToday: generatedRevenue,
        }));

        setRecentPickups(pickupsList.slice(0, 5));
      } catch (err) {
        console.error("Telemetry bridge down:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAdminMetrics();
// Subscribe to immediate network synchronization feeds
const adminChannel = supabase
  .channel("admin-dashboard-feed")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "pickups" },
    () => {
      fetchAdminMetrics();
    }
  )
  .subscribe();

    return () => {
      supabase.removeChannel(adminChannel);
    };
  }, []);

  const getStatusBadgeVariant = (status: string) => {
    switch (status?.toLowerCase()) {
      case "pending": return "destructive";
      case "scheduled": return "default";
      case "en-route": return "secondary";
      case "completed": return "outline";
      default: return "secondary";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium">Synchronizing system telemetry matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Operations overview" subtitle="Real-time network health and activity." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active users" value={metrics.activeUsers} icon={Users} trend="Live platform base" />
        <StatCard label="Collectors online" value={metrics.collectorsOnline} icon={Truck} trend="Active dispatchers" />
        <StatCard label="Live bookings" value={String(metrics.liveBookingsCount)} icon={ClipboardList} trend={`${metrics.pendingCount} pending triage`} />
        <StatCard label="Est. Revenue" value={`$${metrics.revenueToday}`} icon={DollarSign} trend="From completed runs" trendUp />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Revenue trend</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-popover-foreground)" }} />
                <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#rg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Waste by stream</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wasteSplit}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "var(--color-muted)" }} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-popover-foreground)" }} />
                <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-base font-semibold">Recent bookings ledger</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/admin/bookings">View all management layers <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {recentPickups.length > 0 ? (
            recentPickups.map((pickup) => (
              <div key={pickup.id} className="flex flex-wrap items-center gap-4 p-5 transition-colors hover:bg-muted/40">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm">
                    {pickup.id} · <span className="capitalize text-primary">{pickup.waste_type} Stream</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Target date: {pickup.scheduled_date} ({pickup.time_slot}) · User Ref: {pickup.user_id.slice(0, 8)}...
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={getStatusBadgeVariant(pickup.status)} className="capitalize">
                    {pickup.status}
                  </Badge>
                  <span className="font-mono text-sm font-bold">${pickup.price || 15}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No live service entries captured in pickups database yet.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}