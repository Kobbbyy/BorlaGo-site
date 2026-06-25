// src/routes/admin.users.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Search, UserPlus, MoreHorizontal, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminApp } from "@/layouts/admin-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — BorlaGo Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminApp>
      <AdminUsers />
    </AdminApp>
  ),
});

interface LiveUser {
  id: string;
  name: string;
  email: string;
  bookings: number;
  joined: string;
  status: "active" | "suspended";
}

function AdminUsers() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LiveUser[]>([]);

  const fetchUsersDirectory = async () => {
    try {
      // 1. Pull core resident profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, created_at, account_status")
        .order("created_at", { ascending: false });

      if (profileError) throw profileError;

      // 2. Aggregate current booking counts across the ecosystem
      const { data: pickups, error: pickupError } = await supabase
        .from("pickups")
        .select("id, user_id");

      if (pickupError) throw pickupError;

      // Map booking frequencies per profile id block
      const bookingCounts = (pickups || []).reduce((acc: Record<string, number>, pickup: any) => {
        if (pickup.user_id) {
          acc[pickup.user_id] = (acc[pickup.user_id] || 0) + 1;
        }
        return acc;
      }, {});

      // 3. Bind properties into consistent dataset objects
      const mappedUsers: LiveUser[] = (profiles || []).map((p: any) => ({
        id: p.id,
        name: p.full_name || "Ecosystem Resident",
        email: p.email || "no-email@borlago.com",
        bookings: bookingCounts[p.id] || 0,
        joined: new Date(p.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        status: p.account_status === "suspended" ? "suspended" : "active",
      }));

      setUsers(mappedUsers);
    } catch (err) {
      console.error("❌ Profile synchronization failed:", err);
      toast.error("Failed to sync structural resident accounts ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersDirectory();
  }, []);

  const toggleAccountStatus = async (userId: string, currentStatus: "active" | "suspended") => {
    const nextStatus = currentStatus === "active" ? "suspended" : "active";
    const statusToastId = toast.loading(`Updating lifecycle parameters to ${nextStatus}...`);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ account_status: nextStatus })
        .eq("id", userId);

      if (error) throw error;

      toast.success(`Account has been successfully ${nextStatus === "active" ? "activated" : "suspended"}.`, { id: statusToastId });
      // Reload UI local copy arrays
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
    } catch (err) {
      console.error("❌ Structural flag write crash:", err);
      toast.error("Could not complete access privilege transformation.", { id: statusToastId });
    }
  };

  const filtered = users.filter((u) => 
    `${u.name} ${u.email}`.toLowerCase().includes(q.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium">Downloading operational user table registry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        subtitle="Manage resident accounts, triage profile restrictions, and monitor activity lifetimes."
        actions={<Button variant="hero" onClick={() => toast.info("Manual user registration flows should be handled via standard system signup routes.")}><UserPlus className="h-4 w-4" /> Add resident</Button>}
      />

      <Card>
        <div className="flex items-center justify-between gap-3 border-b border-border p-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search records via name or email" className="pl-9" />
          </div>
          <span className="hidden text-sm text-muted-foreground sm:block">{filtered.length} visible matches</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User profile</TableHead>
                <TableHead>Bookings</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {u.name.split(" ").map((p) => p[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm leading-none">{u.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium font-mono text-xs">{u.bookings} runs</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{u.joined}</TableCell>
                    <TableCell>
                      <StatusBadge 
                        label={u.status === "active" ? "Active" : "Suspended"} 
                        tone={u.status === "active" ? "success" : "destructive"} 
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Administrative Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(u.id).then(() => toast.success("UUID saved to clipboard"))}>
                            Copy Database ID
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className={u.status === "active" ? "text-destructive font-medium focus:text-destructive" : "text-emerald-600 font-medium focus:text-emerald-600"}
                            onClick={() => toggleAccountStatus(u.id, u.status)}
                          >
                            {u.status === "active" ? "Suspend Account" : "Activate Account"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center p-8 text-muted-foreground text-sm">
                    No residential accounts match the search parameters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}