import { createFileRoute, Link } from "@tanstack/react-router";
import { Wallet, Briefcase, Star, TrendingUp, MapPin, ArrowRight } from "lucide-react";
import { CollectorApp } from "@/layouts/collector-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { jobs, statusMeta, wasteTypeMeta } from "@/lib/mock-data";

export const Route = createFileRoute("/collector/dashboard")({
  head: () => ({ meta: [{ title: "Collector Dashboard — BorlaGo" }] }),
  component: () => (
    <CollectorApp>
      <CollectorDashboard />
    </CollectorApp>
  ),
});

function CollectorDashboard() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Field operations"
        subtitle="Your jobs, routes and earnings at a glance."
        actions={
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
            <span className="text-sm font-medium">Online</span>
            <Switch defaultChecked />
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Today's earnings" value="$148" icon={Wallet} trend="+12% vs avg" trendUp />
        <StatCard label="Jobs completed" value="9" icon={Briefcase} trend="2 in progress" />
        <StatCard label="Rating" value="4.9" icon={Star} trend="Top 5% collectors" trendUp />
        <StatCard label="Acceptance" value="96%" icon={TrendingUp} trendUp />
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-lg font-semibold">Nearby jobs</h2>
          <Button asChild variant="ghost" size="sm">
            <Link to="/collector/jobs">View all</Link>
          </Button>
        </div>
        <div className="divide-y divide-border">
          {jobs.map((j) => (
            <div key={j.id} className="flex flex-wrap items-center gap-4 p-5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                <MapPin className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold">{wasteTypeMeta[j.wasteType].label} · {j.bags} bags</p>
                <p className="text-sm text-muted-foreground">{j.address} · {j.distanceKm} km · {j.window}</p>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <StatusBadge label={statusMeta[j.status].label} tone={statusMeta[j.status].tone} />
                <span className="font-display text-lg font-bold text-primary">${j.payout}</span>
                <Button asChild variant="hero" size="sm">
                  <Link to="/collector/job/$id" params={{ id: j.id }}>
                    Open <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
