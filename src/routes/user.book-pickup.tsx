// src/routes/user.book-pickup.tsx
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Calendar, Check, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { UserApp } from "@/layouts/user-app";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { wasteTypeMeta } from "@/lib/mock-data";
import type { WasteType } from "@/types";
import { supabase } from "@/lib/supabase";

// mapcn interface imports
import { Map, MapControls, MapMarker } from "@/components/ui/map";
import usePlacesAutocomplete, { getGeocode, getLatLng } from "use-places-autocomplete";

export const Route = createFileRoute("/user/book-pickup")({
  head: () => ({ meta: [{ title: "Book a pickup — BorlaGo" }] }),
  component: () => (
    <UserApp>
      <BookPickup />
    </UserApp>
  ),
});

const windows = ["08:00 – 10:00", "10:00 – 12:00", "13:00 – 15:00", "15:00 – 17:00"];

// MapLibre uses standard [Longitude, Latitude] ordering
const ACCRA_CENTER_LNG_LAT: [number, number] = [-0.1870, 5.6037];
// Google services require the traditional { lat, lng } object format
const ACCRA_CENTER_GOOGLE = { lat: 5.6037, lng: -0.1870 };

function BookPickup() {
  const navigate = useNavigate();
  const [waste, setWaste] = useState<WasteType>("general");
  const [bags, setBags] = useState(2);
  const [slot, setSlot] = useState(windows[0]);
  
  // Controlled inputs for scheduling - Dynamically sets to today's date
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  // Unified viewport tracking context matching your wrapper implementation
  const [viewport, setViewport] = useState({
    center: ACCRA_CENTER_LNG_LAT,
    zoom: 12,
    bearing: 0,
    pitch: 0,
  });
  const [markerPosition, setMarkerPosition] = useState<[number, number]>(ACCRA_CENTER_LNG_LAT);

  // Hook for text address searches with local prioritization bias
  const {
    ready,
    value: autocompleteValue,
    suggestions: { status, data },
    setValue: setAutocompleteValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      locationBias: { radius: 30000, center: ACCRA_CENTER_GOOGLE },
    },
    defaultValue: "12 Independence Ave, Accra",
    debounce: 300,
  });

  const [address, setAddress] = useState("12 Independence Ave, Accra");
  const total = wasteTypeMeta[waste].price + Math.max(0, bags - 2) * 3;

  // Handle autocomplete dropdown selection
  const handleSelectAddress = async (description: string) => {
    setAutocompleteValue(description, false);
    setAddress(description);
    clearSuggestions();

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      
      const targetLngLat: [number, number] = [lng, lat];
      setMarkerPosition(targetLngLat);
      setViewport((prev) => ({
        ...prev,
        center: targetLngLat,
        zoom: 16, // Focus directly on the pinpointed region
      }));
    } catch (error) {
      console.error("Geocoding failed:", error);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        toast.error("Authentication required", { description: "Please sign in again to book a pickup." });
        navigate({ to: "/login" });
        return;
      }

      // Injecting coordinates directly alongside the readable text address string
      const { error: pickupError } = await supabase
        .from("pickups")
        .insert({
          user_id: user.id,
          waste_type: waste,
          estimated_weight: bags * 5,
          address: address,
          latitude: markerPosition[1], // markerPosition[1] is Latitude
          longitude: markerPosition[0], // markerPosition[0] is Longitude
          scheduled_date: date,
          time_window: slot,
          notes: notes || null,
          status: "pending",
          cost: total
        });

      if (pickupError) throw pickupError;

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
                    waste === key ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
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
            
            {/* Autocomplete Input Text Field */}
            <div className="space-y-2">
              <Label htmlFor="address">Address / GPS Search</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  id="address"
                  value={autocompleteValue}
                  onChange={(e) => {
                    setAutocompleteValue(e.target.value);
                    setAddress(e.target.value);
                  }}
                  disabled={!ready || loading}
                  placeholder="Search for an address or pinpoint your location on the map below..."
                  className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
                
                {status === "OK" && (
                  <ul className="absolute z-50 w-full bg-popover text-popover-foreground border rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                    {data.map(({ place_id, description }) => (
                      <li
                        key={place_id}
                        onClick={() => handleSelectAddress(description)}
                        className="px-3 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm border-b last:border-0"
                      >
                        {description}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Interactive mapcn Canvas Container */}
            <div className="w-full h-64 rounded-lg overflow-hidden border relative shadow-inner bg-muted">
              <Map
                viewport={viewport}
                onViewportChange={setViewport}
              >
                <MapControls position="bottom-right" showZoom showLocate />
                
                <MapMarker 
                  longitude={markerPosition[0]} 
                  latitude={markerPosition[1]}
                >
                  <div className="p-2 bg-primary text-primary-foreground rounded-full shadow-md animate-pulse">
                    <MapPin className="h-5 w-5" />
                  </div>
                </MapMarker>
              </Map>
              <div className="absolute bottom-2 left-2 bg-black/80 text-white text-[10px] px-2 py-1 rounded shadow-sm pointer-events-none z-10">
                📍 Map centered over your selected location point
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={loading}
                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                      slot === w ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40",
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