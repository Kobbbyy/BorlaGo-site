// src/routes/user.book-pickup.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, Check, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserApp } from "@/layouts/user-app";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { wasteTypeMeta } from "@/lib/mock-data";
import type { WasteType } from "@/types";
import { supabase } from "@/lib/supabase"; // Import our Supabase client

export const Route = createFileRoute("/user/book-pickup")({
  head: () => ({ meta: [{ title: "Book a pickup — BorlaGo" }] }),
  component: () => (
    <UserApp>
      <BookPickup />
    </UserApp>
  ),
});

const windows = ["08:00 – 10:00", "10:00 – 12:00", "13:00 – 15:00", "15:00 – 17:00"];

function BookPickup() {
  const navigate = useNavigate();
  const [waste, setWaste] = useState<WasteType>("general");
  const [bags, setBags] = useState(2);
  const [slot, setSlot] = useState(windows[0]);
  
  // New controlled inputs for form data fields
  const [address, setAddress] = useState("12 Independence Ave, Accra");
  const [date, setDate] = useState("2026-06-23");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Simple hardcoded pricing conversion (GHS values matched from our database pricing seed)
  const total = wasteTypeMeta[waste].price + Math.max(0, bags - 2) * 3;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Get the current logged-in resident session identifier
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("Authentication required", { description: "Please sign in again to book a pickup." });
        navigate({ to: "/login" });
        return;
      }

      // 2. Inject the dynamic fields right into our public.pickups database table
      const { error: pickupError } = await supabase
        .from("pickups")
        .insert({
          user_id: user.id,
          waste_type: waste,
          estimated_weight: bags * 5, // Basic scale multiplier conversion (e.g., ~5kg per bag)
          address: address,
          scheduled_date: date,
          time_window: slot,
          notes: notes || null,
          status: "pending",
          cost: total
        });

      if (pickupError) throw pickupError;

      // 3. Trigger victory toast feedback notification and reroute
      toast.success("Pickup requested", { description: "We're matching you with a collector." });
      navigate({ to: "/user/bookings" });
      
    } catch (error: any) {
      console.error("Booking submission breakdown error:", error);
      toast.error("Failed to complete booking", { 
        description: error.message || "An unexpected system communication issue occurred." 
      });
    } finally {
      setLoading(false);
    }
  };

  const streams = Object.entries(wasteTypeMeta) as [WasteType, (typeof wasteTypeMeta)[WasteType]][];

  return (
    <div className="space-y-6">
      <PageHeader title="Book a pickup" subtitle="Tell us what to collect and when." />

      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Waste type</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {streams.map(([key, meta]) => (
                <button
                  key={key}
                  type="button"
                  disabled={loading}
                  onClick={() => setWaste(key)}
                  className={cn(
                    "rounded-xl border p-4 text-left transition-colors disabled:opacity-50",
                    waste === key ? "border-primary bg-primary/8" : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <Trash2 className={cn("h-5 w-5", waste === key ? "text-primary" : "text-muted-foreground")} />
                    {waste === key && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="mt-3 text-sm font-semibold">{meta.label}</p>
                  <p className="text-xs text-muted-foreground">{meta.desc}</p>
                  <p className="mt-2 text-sm font-semibold text-primary">GHS {meta.price}</p>
                </button>
              ))}
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h2 className="font-display text-base font-semibold">Pickup details</h2>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  id="address" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  disabled={loading}
                  className="pl-9" 
                  required
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    id="date" 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={loading}
                    className="pl-9" 
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Estimated bags</Label>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon" disabled={loading} onClick={() => setBags((b) => Math.max(1, b - 1))}>–</Button>
                  <span className="w-10 text-center font-semibold">{bags}</span>
                  <Button type="button" variant="outline" size="icon" disabled={loading} onClick={() => setBags((b) => b + 1)}>+</Button>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Time window</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {windows.map((w) => (
                  <button
                    key={w}
                    type="button"
                    disabled={loading}
                    onClick={() => setSlot(w)}
                    className={cn(
                      "rounded-lg border px-2 py-2 text-xs font-medium transition-colors disabled:opacity-50",
                      slot === w ? "border-primary bg-primary/8 text-primary" : "border-border hover:border-primary/40",
                    )}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea 
                id="notes" 
                rows={3} 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                placeholder="Gate code, location of bins, etc." 
              />
            </div>
          </Card>
        </div>

        <div>
          <Card className="sticky top-24 p-5">
            <h2 className="font-display text-base font-semibold">Summary</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Waste type" value={wasteTypeMeta[waste].label} />
              <Row label="Base price" value={`GHS ${wasteTypeMeta[waste].price}`} />
              <Row label="Extra bags" value={`GHS ${Math.max(0, bags - 2) * 3}`} />
              <Row label="Time window" value={slot} />
            </dl>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
              <span className="text-sm font-medium text-muted-foreground">Total</span>
              <span className="font-display text-2xl font-bold">GHS {total}</span>
            </div>
            <Button type="submit" variant="hero" size="lg" className="mt-4 w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing request...
                </>
              ) : (
                "Confirm pickup"
              )}
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              You'll only be charged after collection.
            </p>
          </Card>
        </div>
      </form>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}