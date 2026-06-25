// src/routes/user.profile.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { UserApp } from "@/layouts/user-app";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/user/profile")({
  head: () => ({ meta: [{ title: "My Profile — BorlaGo" }] }),
  component: () => (
    <UserApp>
      <UserProfile />
    </UserApp>
  ),
});

function UserProfile() {
  // Destructure both user and refreshUser cleanly here at the very top
  const { user, refreshUser } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile data states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    async function loadCurrentProfile() {
      if (!user?.id) return;
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name, phone, address, email")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        if (data) {
          setFullName(data.full_name || "");
          setPhone(data.phone || "");
          setAddress(data.address || "");
          // Fallback to auth context session email if database column is null
          setEmail(data.email || user.email || "");
        }
      } catch (err) {
        console.error("❌ Failed to query resident database metadata row:", err);
        toast.error("Could not download account details from server storage.");
      } finally {
        setLoading(false);
      }
    }

    loadCurrentProfile();
  }, [user?.id, user?.email]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSaving(true);
    const saveToastId = toast.loading("Writing profile changes to ledger cluster...");

    try {
      // A. Update the database profiles table row
      const { error: dbError } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          phone: phone,
          address: address,
          email: email,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (dbError) throw dbError;

      // B. Update the user metadata in Supabase Auth so it is permanently cached 
      const { error: authError } = await supabase.auth.updateUser({
        data: { full_name: fullName }
      });

      if (authError) throw authError;

      // C. Force the global auth context to load the changes right away!
      await refreshUser();

      toast.success("Profile updated successfully!", { id: saveToastId });
    } catch (err) {
      console.error("❌ Error running profile transaction update:", err);
      toast.error("Could not commit parameters to infrastructure backend ledger.", { id: saveToastId });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (nameString: string) => {
    return (nameString || "BG")
      .split(" ")
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm font-medium">Sourcing account metadata parameters...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader 
        title="Account Profile" 
        subtitle="Manage your contact identity matrices and pickup delivery parameters." 
      />

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-center gap-5 border-b border-border pb-6 mb-6">
          <Avatar className="h-20 w-20 border-2 border-primary/20">
            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center sm:text-left space-y-1">
            <h2 className="text-xl font-semibold tracking-tight">{fullName || "Ecosystem Resident"}</h2>
            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Mail className="h-3.5 w-3.5" /> {email || "No email linked"}
            </p>
            <span className="inline-flex mt-1 items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              Active Resident Tier
            </span>
          </div>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name reference</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-9"
                  required
                  placeholder="e.g. Samuel Addo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Contact phone routing</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-9"
                  required
                  placeholder="e.g. +233 20 000 0000"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Account Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                value={email}
                disabled
                className="pl-9 bg-muted/50 cursor-not-allowed text-muted-foreground"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Your email is securely linked to your main authentication identity and cannot be edited directly here.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Primary residential address (Garbage pickup drop-point)</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-9"
                required
                placeholder="e.g. House No. 14, Ring Road East, Accra, Ghana"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Ensure this address coordinates align perfectly with your complex location so dispatchers can accurately locate your waste containers.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="hero" type="submit" disabled={saving} className="w-full sm:w-auto">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating server directory...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save profile metadata
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}