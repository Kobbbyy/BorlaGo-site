import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, Filter, ArrowRight } from "lucide-react";
import { CollectorApp } from "@/layouts/collector-app";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { jobs, statusMeta, wasteTypeMeta } from "@/lib/mock-data";

export const Route = createFileRoute("/collector/jobs")({
  head: () => ({ meta: [{ title: "Available jobs — BorlaGo" }] }),
  component: () => (
    <CollectorApp>
      <Jobs />
    </CollectorApp>
  ),
});

function Jobs() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Available jobs"
        subtitle="Accept jobs near you and build your route."
        actions={<Button variant="outline"><Filter className="h-4 w-4" /> Filters</Button>}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {jobs.map((j) => (
          <Card key={j.id} className="p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <MapPin className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{wasteTypeMeta[j.wasteType].label}</p>
                  <p className="text-sm text-muted-foreground">{j.reference}</p>
                </div>
              </div>
              <StatusBadge label={statusMeta[j.status].label} tone={statusMeta[j.status].tone} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2 text-sm">
              <div><dt className="text-muted-foreground">Distance</dt><dd className="font-semibold">{j.distanceKm} km</dd></div>
              <div><dt className="text-muted-foreground">Window</dt><dd className="font-semibold">{j.window}</dd></div>
              <div><dt className="text-muted-foreground">Payout</dt><dd className="font-semibold text-primary">${j.payout}</dd></div>
            </dl>
            <p className="mt-3 text-sm text-muted-foreground">{j.address}</p>
            <div className="mt-4 flex gap-2">
              <Button asChild variant="hero" className="flex-1">
                <Link to="/collector/job/$id" params={{ id: j.id }}>
                  Accept job <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline">Skip</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
