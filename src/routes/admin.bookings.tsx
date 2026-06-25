import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";
import { AdminApp } from "@/layouts/admin-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { bookings, statusMeta, wasteTypeMeta } from "@/lib/mock-data";
import type { BookingStatus } from "@/types";

export const Route = createFileRoute("/admin/bookings")({
  head: () => ({ meta: [{ title: "Bookings — BorlaGo Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminApp>
      <AdminBookings />
    </AdminApp>
  ),
});

const filters: { value: "all" | BookingStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "en-route", label: "Active" },
  { value: "completed", label: "Completed" },
];

function AdminBookings() {
  const [filter, setFilter] = useState<"all" | BookingStatus>("all");
  const [q, setQ] = useState("");

  const filtered = bookings.filter((b) => {
    const mf = filter === "all" ? true : filter === "en-route" ? ["en-route", "in-progress"].includes(b.status) : b.status === filter;
    const mq = q ? `${b.reference} ${b.address}`.toLowerCase().includes(q.toLowerCase()) : true;
    return mf && mq;
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Bookings" subtitle="Oversee every collection across the network." />

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

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Collector</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((b) => (
                <TableRow key={b.id}>
                  <TableCell className="font-medium">{b.reference}</TableCell>
                  <TableCell>{wasteTypeMeta[b.wasteType].label}</TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">{b.address}</TableCell>
                  <TableCell className="text-muted-foreground">{b.collector ?? "Unassigned"}</TableCell>
                  <TableCell><StatusBadge label={statusMeta[b.status].label} tone={statusMeta[b.status].tone} /></TableCell>
                  <TableCell className="text-right font-semibold">${b.price}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
