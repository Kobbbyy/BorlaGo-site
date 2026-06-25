// src/routes/user.settings.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Moon, CreditCard, Shield, Trash2, Loader2 } from "lucide-react";
import { UserApp } from "@/layouts/user-app";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/store/theme";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export const Route = createFileRoute("/user/settings")({
  head: () => ({ meta: [{ title: "Settings — BorlaGo" }] }),
  component: () => (
    <UserApp>
      <Settings />
    </UserApp>
  ),
});

function SettingRow({
  icon: Icon,
  title,
  desc,
  control,
}: {
  icon: typeof Bell;
  title: string;
  desc: string;
  control: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted text-muted-foreground">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{desc}</p>
      </div>
      {control}
    </div>
  );
}

function Settings() {
  const { theme, toggle } = useTheme();
  
  // App settings state tracking
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleTogglePush = async (checked: boolean) => {
    setPushEnabled(checked);
    // Dynamic feedback hook
    toast.success(checked ? "Push alerts enabled" : "Push alerts muted");
  };

  const handleToggleEmail = async (checked: boolean) => {
    setEmailEnabled(checked);
    toast.success(checked ? "Subscribed to weekly summaries" : "Unsubscribed from weekly summaries");
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you absolutely sure you want to delete your BorlaGo account? This actions wipes all address profiles and dispatch histories permanently."
    );
    
    if (!confirmDelete) return;

    setDeleting(true);
    try {
      // In production, invoke your custom edge function or backend RPC line handling deletion routines
      const { error } = await supabase.rpc("delete_user_account");
      if (error) throw error;

      await supabase.auth.signOut();
      toast.success("Account successfully removed");
    } catch (err: any) {
      console.error("Account destruction failure:", err);
      // Fallback message if structural RPC endpoint permissions are pending
      toast.error("Failed to process account termination", {
        description: "Please contact administration support directly at support@borlago.com"
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Preferences, notifications and account." />

      <Card>
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold">Preferences</h2>
        </div>
        <div className="divide-y divide-border">
          <SettingRow 
            icon={Moon} 
            title="Dark mode" 
            desc="Use the dark theme across BorlaGo." 
            control={<Switch checked={theme === "dark"} onCheckedChange={toggle} />} 
          />
          <SettingRow 
            icon={Bell} 
            title="Push notifications" 
            desc="Pickup updates and collector ETAs." 
            control={<Switch checked={pushEnabled} onCheckedChange={handleTogglePush} />} 
          />
          <SettingRow 
            icon={Bell} 
            title="Email summaries" 
            desc="Weekly recap of your collections." 
            control={<Switch checked={emailEnabled} onCheckedChange={handleToggleEmail} />} 
          />
        </div>
      </Card>

      <Card>
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-base font-semibold">Billing & security</h2>
        </div>
        <div className="divide-y divide-border">
          <SettingRow 
            icon={CreditCard} 
            title="Payment methods" 
            desc="Visa ending 4242" 
            control={<Button variant="outline" size="sm">Manage</Button>} 
          />
          <SettingRow 
            icon={Shield} 
            title="Two-factor auth" 
            desc="Add an extra layer of security." 
            control={<Switch checked={mfaEnabled} onCheckedChange={setMfaEnabled} />} 
          />
        </div>
      </Card>

      <Card className="border-destructive/30">
        <div className="flex flex-wrap items-center gap-4 p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/12 text-destructive">
            <Trash2 className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-medium">Delete account</p>
            <p className="text-sm text-muted-foreground">Permanently remove your data.</p>
          </div>
          <Button 
            variant="destructive" 
            size="sm" 
            disabled={deleting}
            onClick={handleDeleteAccount}
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Delete"}
          </Button>
        </div>
      </Card>
    </div>
  );
}