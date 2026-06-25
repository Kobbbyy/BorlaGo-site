// src/routes/user.tracking.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Truck, Phone, MessageSquare, MapPin, CheckCircle2, Circle, Loader2 } from "lucide-react";
import { UserApp } from "@/layouts/user-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/user/tracking")({
  head: () => ({ meta: [{ title: "Live tracking — BorlaGo" }] }),
  component: () => (
    <UserApp>
      <Tracking />
    </UserApp>
  ),
});

const STATUS_STEPS = ["pending", "scheduled", "en-route", "arrived", "completed"];

function Tracking() {
  const bookingId = "BG-7741"; 

  const [loading, setLoading] = useState(true);
  const [pickup, setPickup] = useState<any>(null);
  const [collector, setCollector] = useState<any>(null);

  useEffect(() => {
    async function fetchTrackingData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        // 1. Fetch pickup details
        const { data: pickupData, error: pickupError } = await supabase
          .from("pickups")
          .select("*")
          .eq("id", bookingId);

        if (pickupError) throw pickupError;

        if (!pickupData || pickupData.length === 0) {
          console.warn(`No active booking found matching record frame: ${bookingId}`);
          setLoading(false);
          return;
        }

        const activePickup = pickupData[0];
        setPickup(activePickup);

        // 2. Fetch assigned collector details if available
        if (activePickup?.collector_id) {
          const { data: collectorData, error: collectorError } = await supabase
            .from("collectors")
            .select("*")
            .eq("id", activePickup.collector_id)
            .single();

          if (!collectorError) setCollector(collectorData);
        }
      } catch (err: any) {
        console.error("Tracking fetch error:", err);
        toast.error("Failed to load tracking details");
      } finally {
        setLoading(false);
      }
    }

    fetchTrackingData();

    // 3. Listen for real-time status updates from the driver's app
    const trackingChannel = supabase
      .channel(`live-tracking:${bookingId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pickups", filter: `id=eq.${bookingId}` },
        (payload) => {
          setPickup(payload.new);
          toast.info(`Status updated: ${payload.new.status}`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(trackingChannel);
    };
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium">Connecting to collector telemetry...</p>
      </div>
    );
  }

  const currentStatusIndex = STATUS_STEPS.indexOf(pickup?.status || "pending");
  
  const timeline = [
    { label: "Pickup requested", done: currentStatusIndex >= 0, active: currentStatusIndex === 0 },
    { label: "Collector assigned", done: currentStatusIndex >= 1, active: currentStatusIndex === 1 },
    { label: "Collector en route", done: currentStatusIndex >= 2, active: currentStatusIndex === 2 },
    { label: "Arrived at location", done: currentStatusIndex >= 3, active: currentStatusIndex === 3 },
    { label: "Collection complete", done: currentStatusIndex >= 4, active: currentStatusIndex === 4 },
  ];

  const collectorInitials = collector?.name?.split(" ").map((n: string) => n[0]).join("") || "CO";

  return (
    <div className="space-y-6">
      <PageHeader title="Live tracking" subtitle={`Booking ${bookingId} · ${pickup?.waste_type || "General waste"}`} />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[16/10] bg-grid">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
            
            {/* Fixed vector line paths using absolute viewport coordinates instead of percentages */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 12 80 C 35 60, 50 70, 80 22" fill="none" stroke="currentColor" className="text-primary" strokeWidth="1" strokeDasharray="2 2" strokeLinecap="round" opacity="0.7" />
            </svg>
            
            <span className={`absolute transition-all duration-1000 ${currentStatusIndex >= 3 ? "left-[80%] top-[20%]" : "left-[12%] top-[80%]"} flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow`}>
              <Truck className="h-5 w-5" />
            </span>
            
            <span className="absolute right-[18%] top-[20%] flex h-9 w-9 items-center justify-center rounded-full border-2 border-background bg-primary/20">
              <MapPin className="h-4 w-4 text-primary" />
            </span>
            
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl glass p-4">
              <div>
                <p className="text-xs text-muted-foreground">Status Window</p>
                <p className="font-display text-xl font-bold text-primary">
                  {pickup?.status === "en-route" ? "~6 minutes away" : pickup?.status || "Processing"}
                </p>
              </div>
              <StatusBadge label={pickup?.status || "pending"} tone={pickup?.status === "completed" ? "success" : "warning"} />
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {collector ? (
            <Card className="p-5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/15 font-semibold text-primary">{collectorInitials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{collector.name}</p>
                  <p className="text-sm text-muted-foreground">★ {collector.rating || "5.0"} · {collector.completed_pickups_count || 0} pickups</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button variant="outline" asChild>
                  <a href={`tel:${collector.phone || ""}`}><Phone className="h-4 w-4 mr-2" /> Call</a>
                </Button>
                <Button variant="outline"><MessageSquare className="h-4 w-4 mr-2" /> Chat</Button>
              </div>
            </Card>
          ) : (
            <Card className="p-5 text-center text-muted-foreground text-sm">
              Finding an available eco-collector near your location...
            </Card>
          )}

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Progress Timeline</h2>
            <ol className="mt-4 space-y-4">
              {timeline.map((t) => (
                <li key={t.label} className="flex items-start gap-3">
                  {t.active ? (
                    <Loader2 className="h-5 w-5 text-primary animate-spin" />
                  ) : t.done ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground/40" />
                  )}
                  <div className="flex-1">
                    <p className={t.done ? "text-sm font-medium" : "text-sm text-muted-foreground"}>{t.label}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}