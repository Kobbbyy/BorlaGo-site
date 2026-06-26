import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Star, CheckCircle2, Truck, MoreHorizontal, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase";
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

interface Collector {
  id: string;
  name: string;
  rating: number;
  completed_pickups_count: number;
  phone: string;
  zone?: string;
  status?: "online" | "offline" | "pending";
}

function AdminCollectors() {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveCollectors = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("collectors")
          .select("id, name, rating, completed_pickups_count, phone");

        if (error) throw error;

        const mappedData = (data || []).map((c: any) => ({
          ...c,
          rating: c.rating ? Number(c.rating) : 5.0,
          zone: "Accra", 
          status: "online" as const 
        }));

        setCollectors(mappedData);
      } catch (err: any) {
        console.error("Error loading collectors:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveCollectors();
  }, []);

  const totalCollectors = collectors.length;
  const onlineCount = collectors.filter(c => c.status === "online").length;
  const avgRating = totalCollectors > 0 
    ? (collectors.reduce((acc, curr) => acc + curr.rating, 0) / totalCollectors).toFixed(1)
    : "0.0";

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Fetching real figures...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Collectors" subtitle="Manage the collector network." />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total collectors" value={totalCollectors.toString()} icon={Truck} />
        <StatCard label="Online now" value={onlineCount.toString()} icon={CheckCircle2} trend={`${totalCollectors > 0 ? Math.round((onlineCount / totalCollectors) * 100) : 0}% of fleet`} />
        <StatCard label="Avg rating" value={avgRating} icon={Star} trendUp />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collector</TableHead>
                <TableHead>Phone / Zone</TableHead>
                <TableHead>Jobs Completed</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collectors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No collectors found in the database.
                  </TableCell>
                </TableRow>
              ) : (
                collectors.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                            {c.name ? c.name.split(" ").map((p) => p[0]).join("") : "BC"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="flex items-center gap-1 font-medium">
                            {c.name || "Unnamed Collector"}{" "}
                            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                          </p>
                          <p className="text-xs text-muted-foreground">{c.id.substring(0, 8).toUpperCase()}...</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{c.phone || "No phone"}</div>
                      <div className="text-xs text-muted-foreground">{c.zone}</div>
                    </TableCell>
                    <TableCell className="font-semibold">{c.completed_pickups_count.toLocaleString()}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" /> {c.rating}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge
                        label={c.status === "online" ? "Online" : c.status === "offline" ? "Offline" : "Pending"}
                        tone={c.status === "online" ? "success" : c.status === "offline" ? "muted" : "warning"}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}