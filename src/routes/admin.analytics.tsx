import { createFileRoute } from "@tanstack/react-router";
import { Users, Repeat, Clock, Leaf } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { AdminApp } from "@/layouts/admin-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card } from "@/components/ui/card";
import { revenueSeries, wasteSplit } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/analytics")({
  head: () => ({ meta: [{ title: "Analytics — BorlaGo Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminApp>
      <AdminAnalytics />
    </AdminApp>
  ),
});

const pieColors = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)"];

function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Network performance and sustainability metrics." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New signups" value="1,284" icon={Users} trend="+18% WoW" trendUp />
        <StatCard label="Repeat rate" value="64%" icon={Repeat} trendUp />
        <StatCard label="Avg response" value="11 min" icon={Clock} trend="-2 min" trendUp />
        <StatCard label="Landfill diverted" value="71%" icon={Leaf} trendUp />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Pickups over time</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-popover-foreground)" }} />
                <Line type="monotone" dataKey="value" stroke="var(--color-primary)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base font-semibold">Stream distribution</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={wasteSplit} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {wasteSplit.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, color: "var(--color-popover-foreground)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
