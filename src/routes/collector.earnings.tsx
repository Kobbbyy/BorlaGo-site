import { createFileRoute } from "@tanstack/react-router";
import { Wallet, TrendingUp, Clock, Download, ArrowUpRight } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { CollectorApp } from "@/layouts/collector-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { revenueSeries } from "@/lib/mock-data";

export const Route = createFileRoute("/collector/earnings")({
  head: () => ({ meta: [{ title: "Earnings — BorlaGo" }] }),
  component: () => (
    <CollectorApp>
      <Earnings />
    </CollectorApp>
  ),
});

const payouts = [
  { id: "p1", date: "Jun 18", jobs: 11, amount: 142, status: "Paid" },
  { id: "p2", date: "Jun 11", jobs: 9, amount: 118, status: "Paid" },
  { id: "p3", date: "Jun 04", jobs: 14, amount: 176, status: "Paid" },
];

function Earnings() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Earnings"
        subtitle="Track your payouts and performance."
        actions={<Button variant="outline"><Download className="h-4 w-4" /> Statement</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available balance" value="$284" icon={Wallet} trend="Next payout Mon" />
        <StatCard label="This week" value="$148" icon={TrendingUp} trend="+12%" trendUp />
        <StatCard label="Avg / job" value="$13.4" icon={Clock} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Weekly earnings</h2>
          <span className="text-sm font-semibold text-success">+18% <ArrowUpRight className="inline h-3.5 w-3.5" /></span>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueSeries}>
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-popover-foreground)" }}
              />
              <Area type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} fill="url(#g)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="border-b border-border p-5">
          <h2 className="font-display text-base font-semibold">Recent payouts</h2>
        </div>
        <div className="divide-y divide-border">
          {payouts.map((p) => (
            <div key={p.id} className="flex items-center gap-4 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/12 text-success"><Wallet className="h-5 w-5" /></span>
              <div>
                <p className="font-medium">Week of {p.date}</p>
                <p className="text-sm text-muted-foreground">{p.jobs} jobs</p>
              </div>
              <div className="ml-auto text-right">
                <p className="font-display text-lg font-bold">${p.amount}</p>
                <p className="text-xs text-success">{p.status}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
