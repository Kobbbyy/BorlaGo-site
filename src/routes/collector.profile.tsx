import { createFileRoute } from "@tanstack/react-router";
import { Camera, Star, Truck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { CollectorApp } from "@/layouts/collector-app";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/collector/profile")({
  head: () => ({ meta: [{ title: "Collector profile — BorlaGo" }] }),
  component: () => (
    <CollectorApp>
      <Profile />
    </CollectorApp>
  ),
});

function Profile() {
  const { user } = useAuth();
  const save = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Profile updated");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" subtitle="Your collector account and vehicle details." />

      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <Card className="p-6 text-center">
          <div className="relative mx-auto w-fit">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-primary/15 text-2xl font-bold text-primary">
                {user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold">{user?.name}</h2>
          <p className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-warning text-warning" /> 4.9 · 1,240 pickups
          </p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/60 p-3">
              <CheckCircle2 className="mx-auto h-5 w-5 text-success" />
              <p className="mt-1 text-sm font-semibold">Verified</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-3">
              <Truck className="mx-auto h-5 w-5 text-primary" />
              <p className="mt-1 text-sm font-semibold">Compactor</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <form onSubmit={save} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="n">Full name</Label><Input id="n" defaultValue={user?.name} /></div>
              <div className="space-y-2"><Label htmlFor="e">Email</Label><Input id="e" defaultValue={user?.email} /></div>
              <div className="space-y-2"><Label htmlFor="p">Phone</Label><Input id="p" defaultValue={user?.phone} /></div>
              <div className="space-y-2"><Label htmlFor="v">Vehicle plate</Label><Input id="v" defaultValue="GR-2204-24" /></div>
              <div className="space-y-2"><Label htmlFor="z">Service zone</Label><Input id="z" defaultValue="Greater Accra" /></div>
              <div className="space-y-2"><Label htmlFor="l">License no.</Label><Input id="l" defaultValue="DL-99812" /></div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline">Cancel</Button>
              <Button type="submit" variant="hero">Save changes</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
