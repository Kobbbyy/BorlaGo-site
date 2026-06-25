import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Phone, ArrowLeft, Navigation, CheckCircle2, Camera } from "lucide-react";
import { toast } from "sonner";
import { CollectorApp } from "@/layouts/collector-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { jobs, statusMeta, wasteTypeMeta } from "@/lib/mock-data";

export const Route = createFileRoute("/collector/job/$id")({
  head: () => ({ meta: [{ title: "Job details — BorlaGo" }] }),
  component: () => (
    <CollectorApp>
      <JobDetail />
    </CollectorApp>
  ),
});

const stages = ["Accepted", "En route", "Arrived", "Completed"];

function JobDetail() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const job = jobs.find((j) => j.id === id) ?? jobs[0];
  const [stage, setStage] = useState(1);

  const advance = () => {
    if (stage < stages.length - 1) {
      setStage((s) => s + 1);
      toast.success(`Status: ${stages[stage + 1]}`);
    } else {
      toast.success("Job completed", { description: `You earned $${job.payout}.` });
      navigate({ to: "/collector/history" });
    }
  };

  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/collector/jobs"><ArrowLeft className="h-4 w-4" /> Back to jobs</Link>
      </Button>

      <PageHeader
        title={`${wasteTypeMeta[job.wasteType].label} pickup`}
        subtitle={`${job.reference} · ${job.bags} bags · $${job.payout} payout`}
        actions={<StatusBadge label={statusMeta[job.status].label} tone={statusMeta[job.status].tone} />}
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/9] bg-grid">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
              <span className="absolute right-[20%] top-[30%] flex h-10 w-10 items-center justify-center rounded-full bg-gradient-brand text-primary-foreground shadow-glow">
                <MapPin className="h-5 w-5" />
              </span>
              <Button className="absolute bottom-4 left-4" variant="glass">
                <Navigation className="h-4 w-4" /> Navigate
              </Button>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Progress</h2>
            <div className="mt-4 flex items-center gap-2">
              {stages.map((s, i) => (
                <div key={s} className="flex flex-1 flex-col items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${i <= stage ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                    {i < stage ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                  </div>
                  <span className={`text-center text-xs ${i <= stage ? "font-medium" : "text-muted-foreground"}`}>{s}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 flex gap-2">
              <Button variant="outline" className="flex-1"><Camera className="h-4 w-4" /> Add photo</Button>
              <Button variant="hero" className="flex-1" onClick={advance}>
                {stage < stages.length - 1 ? `Mark ${stages[stage + 1]}` : "Complete job"}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Customer</h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar className="h-11 w-11"><AvatarFallback className="bg-primary/15 font-semibold text-primary">{job.customer.split(" ").map((p) => p[0]).join("")}</AvatarFallback></Avatar>
              <div>
                <p className="font-semibold">{job.customer}</p>
                <p className="text-sm text-muted-foreground">{job.address}</p>
              </div>
            </div>
            <Button variant="outline" className="mt-4 w-full"><Phone className="h-4 w-4" /> Call customer</Button>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base font-semibold">Details</h2>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Waste type</dt><dd className="font-medium">{wasteTypeMeta[job.wasteType].label}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Bags</dt><dd className="font-medium">{job.bags}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Window</dt><dd className="font-medium">{job.window}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Distance</dt><dd className="font-medium">{job.distanceKm} km</dd></div>
              <div className="flex justify-between border-t border-border pt-3"><dt className="text-muted-foreground">Payout</dt><dd className="font-display text-lg font-bold text-primary">${job.payout}</dd></div>
            </dl>
          </Card>
        </div>
      </div>
    </div>
  );
}
