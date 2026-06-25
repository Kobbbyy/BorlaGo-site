// src/routes/user.schedule.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Calendar as CalendarIcon, Clock, Trash2, Loader2, AlertCircle } from "lucide-react";
import { UserApp } from "@/layouts/user-app";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/user/schedule")({
  head: () => ({ meta: [{ title: "Your Schedule — BorlaGo" }] }),
  component: () => (
    <UserApp>
      <Schedule />
    </UserApp>
  ),
});

interface ScheduledPickup {
  id: string; // Correctly matching our new human-readable custom text ID types ('BG-XXXX')
  scheduled_date: string;
  time_slot: "morning" | "afternoon";
  waste_type: string;
  status: string;
}

function Schedule() {
  const [loading, setLoading] = useState(true);
  const [pickups, setPickups] = useState<ScheduledPickup[]>([]);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Generate a dynamic 7-day rolling schedule array starting from today
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const daysOfWeek = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return {
      isoString: d.toISOString().split("T")[0],
      dayName: d.toLocaleDateString("en-US", { weekday: "short" }),
      dayNum: d.getDate(),
    };
  });

  useEffect(() => {
    async function fetchSchedules() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user?.id) {
          console.warn("Schedule sync aborted: No active authentication session found.");
          setLoading(false);
          return;
        }

        // Fetch user schedule runs safely utilizing wildcard select mappings
        const { data, error } = await supabase
          .from("pickups")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;
        
        // Cleanly filter relevant upcoming states on client-side to prevent schema mismatch dropouts
        const incomingSchedules = (data || []).filter((p: any) => 
          ["pending", "scheduled", "en-route", "dispatched"].includes(p.status?.toLowerCase())
        );

        setPickups(incomingSchedules);
      } catch (err: any) {
        console.error("👉 Error pulling collection schedule:", err);
        if (err.message) {
          console.error("Supabase ledger details:", err.message);
        }
        toast.error("Failed to sync schedule ledger");
      } finally {
        setLoading(false);
      }
    }

    fetchSchedules();
  }, []);

  const handleCancelPickup = async (pickupId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this scheduled collection?");
    if (!confirmCancel) return;

    setCancellingId(pickupId);
    try {
      const { error } = await supabase
        .from("pickups")
        .update({ status: "cancelled" })
        .eq("id", pickupId);

      if (error) throw error;

      setPickups((prev) => prev.filter((p) => p.id !== pickupId));
      toast.success("Pickup cancelled successfully");
    } catch (err: any) {
      console.error("Cancellation block fault:", err);
      toast.error("Could not complete operational cancellation");
    } finally {
      setCancellingId(null);
    }
  };

  // Filter pickups matching the day selected in our dynamic strip layout
  const activeDayPickups = pickups.filter((p) => p.scheduled_date === selectedDate);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium">Aligning dispatcher calendar windows...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Collection schedule" subtitle="Manage upcoming operational runs and service bookings." />

      {/* 7-Day Rolling Inline Date Picker Strip */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {daysOfWeek.map((day) => {
          const isSelected = day.isoString === selectedDate;
          const hasPickup = pickups.some((p) => p.scheduled_date === day.isoString);

          return (
            <button
              key={day.isoString}
              type="button"
              onClick={() => setSelectedDate(day.isoString)}
              className={`flex min-w-[62px] flex-col items-center rounded-2xl border p-3 transition-all ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-card hover:bg-muted/50"
              }`}
            >
              <span className={`text-xs ${isSelected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {day.dayName}
              </span>
              <span className="mt-1 font-display text-lg font-bold">{day.dayNum}</span>
              {hasPickup && (
                <span className={`mt-1 h-1.5 w-1.5 rounded-full ${isSelected ? "bg-background" : "bg-primary"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Target Selected Day Ledger Outputs */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-semibold">
          {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
        </h3>

        {activeDayPickups.length > 0 ? (
          <div className="grid gap-3">
            {activeDayPickups.map((pickup) => (
              <Card key={pickup.id} className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary mt-0.5">
                    <CalendarIcon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-medium text-sm capitalize">{pickup.waste_type} Collection</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {pickup.time_slot === "morning" ? "6:00 AM - 11:30 AM" : "1:00 PM - 5:30 PM"}
                      </span>
                      <span>·</span>
                      <span>Ref: {pickup.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant={pickup.status === "scheduled" ? "default" : "secondary"} className="capitalize">
                    {pickup.status}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    disabled={cancellingId === pickup.id}
                    onClick={() => handleCancelPickup(pickup.id)}
                  >
                    {cancellingId === pickup.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium">No collections booked for this date</p>
            <p className="text-xs max-w-xs mt-0.5">
              Need a drop-off setup? Use the booking route layout to lock down a time window.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}