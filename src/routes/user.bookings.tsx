// src/routes/user.bookings.tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Truck, Search, PackagePlus, Loader2 } from "lucide-react";
import { UserApp } from "@/layouts/user-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { statusMeta, wasteTypeMeta } from "@/lib/mock-data";
import type { BookingStatus } from "@/types";
import { supabase } from "@/lib/supabase"; // Live connection client
import { toast } from "sonner";

export const Route = createFileRoute("/user/bookings")({
  head: () => ({ meta: [{ title: "My bookings — BorlaGo" }] }),
  component: () => (
    <UserApp>
      <Bookings />
    </UserApp>
  ),
});

const filters: { value: "all" | BookingStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "en-route", label: "Active" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
];

function Bookings() {
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [q, setQ] = useState("");
  
  // Real database states
  const [dbBookings, setDbBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real pickups belonging to the logged-in resident
  useEffect(() => {
    async function fetchMyBookings() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("pickups")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setDbBookings(data || []);
      } catch (error: any) {
        console.error("Error fetching live bookings:", error);
        toast.error("Could not sync history", { description: error.message });
      } finally {
        setLoading(false);
      }
    }

    fetchMyBookings();
  }, []);

  // Filter local state based on live database parameters
  const filtered = dbBookings.filter((b) => {
    // Treat 'pending' or active states under our UI filters matching mechanism
    const currentStatus: BookingStatus = b.status;
    const matchFilter =
      filter === "all" 
        ? true 
        : filter === "en-route" 
          ? ["en-route", "in-progress", "pending"].includes(currentStatus) 
          : currentStatus === filter;

   const typeLabel = wasteTypeMeta[b.waste_type as keyof typeof wasteTypeMeta]?.label || b.waste_type;
    const matchQ = q 
      ? `${b.id.slice(0, 8)} ${typeLabel}`.toLowerCase().includes(q.toLowerCase()) 
      : true;

    return matchFilter && matchQ;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="My bookings"
        subtitle="All your past and upcoming collections."
        actions={
          <Button asChild variant="hero">
            <Link to="/user/book-pickup">
              <PackagePlus className="h-4 w-4" /> Book pickup
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                filter === f.value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search bookings" className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
          <p className="text-sm">Retrieving your live pickup manifest...</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((b) => {
            // Provide dynamic fallbacks if database value is null or unmapped
            const typeMeta = wasteTypeMeta[b.waste_type as keyof typeof wasteTypeMeta] || { label: "General Waste" };
            const statusInfo = statusMeta[b.status as keyof typeof statusMeta] || { label: "Pending", tone: "warning" };
            const visualRef = `#BG-${b.id.slice(0, 6).toUpperCase()}`;

            return (
              <Card key={b.id} className="flex flex-wrap items-center gap-4 p-5">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <Truck className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{typeMeta.label}</p>
                    <span className="text-xs text-muted-foreground font-mono">{visualRef}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {b.scheduled_date} · {b.time_window} {b.collector_id && `· Collector Assigned`}
                  </p>
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <StatusBadge label={statusInfo.label} tone={statusInfo.tone as any} />
                  <span className="font-display text-lg font-bold">GHS {b.cost || 0}</span>
                </div>
              </Card>
            );
          })}

          {filtered.length === 0 && (
            <Card className="p-12 text-center text-sm text-muted-foreground">
              No live bookings found matching your current filters.
            </Card>
          )}
        </div>
      )}
    </div>
  );
}