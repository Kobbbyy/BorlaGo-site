// src/routes/admin.settings.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Moon, Bell, Shield, Globe, Percent, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminApp } from "@/layouts/admin-app";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/store/theme";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — BorlaGo Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminApp>
      <AdminSettings />
    </AdminApp>
  ),
});

function Row({ icon: Icon, title, desc, control }: { icon: typeof Bell; title: string; desc: string; control: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground"><Icon className="h-5 w-5" /></span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      {control}
    </div>
  );
}

function AdminSettings() {
  const { theme, toggle } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Core administrative control metrics states
  const [commission, setCommission] = useState("35"); // Matches our financial panel logic
  const [baseFee, setBaseFee] = useState("15");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [operationalAlerts, setOperationalAlerts] = useState(true);

  // Load configuration matrix profile from Supabase on mount
  useEffect(() => {
    async function loadSystemConfig() {
      try {
        const { data, error } = await supabase
          .from("system_settings")
          .select("*")
          .single();

        if (error && error.code !== "PGRST116") throw error; // Ignore missing row catch-all errors

        if (data) {
          setCommission(String(data.platform_commission ?? "35"));
          setBaseFee(String(data.base_fee ?? "15"));
          setMaintenanceMode(!!data.maintenance_mode);
          setOperationalAlerts(!!data.operational_alerts);
        }
      } catch (err) {
        console.error("❌ System config sync breakdown:", err);
        toast.error("Failed to query runtime variable structures from DB");
      } finally {
        setLoading(false);
      }
    }

    loadSystemConfig();
  }, []);

  const handleUpdateConfig = async () => {
    setSaving(true);
    const updateToastId = toast.loading("Writing changes to system infrastructure context...");

    try {
      const payload = {
        id: 1, // Static baseline singleton identifier
        platform_commission: parseFloat(commission),
        base_fee: parseFloat(baseFee),
        maintenance_mode: maintenanceMode,
        operational_alerts: operationalAlerts,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("system_settings")
        .upsert(payload, { onConflict: "id" });

      if (error) throw error;

      toast.success("System parameters updated successfully!", { id: updateToastId });
    } catch (err) {
      console.error("❌ Failed to push structural settings configuration:", err);
      toast.error("Could not write parameters to remote cluster ledger.", { id: updateToastId });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium">Downloading console parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Platform configuration and runtime cluster parameters." />

      <Card>
        <div className="border-b border-border px-5 py-4"><h2 className="font-display text-base font-semibold">Platform toggles</h2></div>
        <div className="divide-y divide-border">
          <Row icon={Moon} title="Dark mode" desc="Console appearance state configuration." control={<Switch checked={theme === "dark"} onCheckedChange={toggle} />} />
          <Row icon={Bell} title="Operational alerts" desc="SLA breaches and logistics incidents notification routing." control={<Switch checked={operationalAlerts} onCheckedChange={setOperationalAlerts} />} />
          <Row icon={Globe} title="Maintenance mode" desc="Temporarily pause incoming dispatcher booking cycles platform-wide." control={<Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />} />
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="font-display text-base font-semibold">Pricing matrix adjustments</h2>
        <p className="text-xs text-muted-foreground mt-0.5 mb-4">Controls the real-time revenue distributions calculated on management ledgers.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="comm">Platform commission split margin</Label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                id="comm" 
                value={commission} 
                onChange={(e) => setCommission(e.target.value)} 
                className="pl-9" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="base">Base pickup fee reference unit ($)</Label>
            <Input 
              id="base" 
              value={baseFee} 
              onChange={(e) => setBaseFee(e.target.value)} 
            />
          </div>
        </div>
        <Button variant="hero" className="mt-5" onClick={handleUpdateConfig} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving parameters...
            </>
          ) : (
            "Save operational changes"
          )}
        </Button>
      </Card>

      <Card>
        <div className="border-b border-border px-5 py-4"><h2 className="font-display text-base font-semibold">Infrastructure security</h2></div>
        <div className="divide-y divide-border">
          <Row icon={Shield} title="Enforce multi-factor auth for staff" desc="Require active MFA validation keys for admin level scopes." control={<Switch defaultChecked disabled />} />
          <Row icon={Shield} title="Regional IP restriction" desc="Restrict management access to secure logistics networks." control={<Switch disabled />} />
        </div>
      </Card>
    </div>
  );
}