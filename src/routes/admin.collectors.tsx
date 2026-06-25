import { createFileRoute } from "@tanstack/react-router";
import { Star, CheckCircle2, Truck, MoreHorizontal } from "lucide-react";
import { AdminApp } from "@/layouts/admin-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const Route = createFileRoute("/admin/collectors")({
  head: () => ({ meta: [{ title: "Collectors — BorlaGo Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminApp>
      <AdminCollectors />
    </AdminApp>
  ),
});

const collectors = [
  { id: "c1", name: "Kojo Asante", zone: "Greater Accra", jobs: 1240, rating: 4.9, status: "online" as const, verified: true },
  { id: "c2", name: "Ama Owusu", zone: "Tema", jobs: 880, rating: 4.8, status: "online" as const, verified: true },
  { id: "c3", name: "Yaw Boateng", zone: "Kumasi", jobs: 612, rating: 4.7, status: "offline" as const, verified: true },
  { id: "c4", name: "Abena Darko", zone: "Accra Central", jobs: 145, rating: 4.6, status: "pending" as const, verified: false },
];

function AdminCollectors() {
  return (
    <div className="space-y-6">
      <PageHeader title="Collectors" subtitle="Manage the collector network." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total collectors" value="2,400" icon={Truck} />
        <StatCard label="Online now" value="312" icon={CheckCircle2} trend="13% of fleet" />
        <StatCard label="Avg rating" value="4.8" icon={Star} trendUp />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collector</TableHead>
                <TableHead>Zone</TableHead>
                <TableHead>Jobs</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectors.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9"><AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">{c.name.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
                      <div>
                        <p className="flex items-center gap-1 font-medium">{c.name} {c.verified && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}</p>
                        <p className="text-xs text-muted-foreground">{c.id.toUpperCase()}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.zone}</TableCell>
                  <TableCell>{c.jobs.toLocaleString()}</TableCell>
                  <TableCell><span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-warning text-warning" /> {c.rating}</span></TableCell>
                  <TableCell>
                    <StatusBadge
                      label={c.status === "online" ? "Online" : c.status === "offline" ? "Offline" : "Pending"}
                      tone={c.status === "online" ? "success" : c.status === "offline" ? "muted" : "warning"}
                    />
                  </TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
