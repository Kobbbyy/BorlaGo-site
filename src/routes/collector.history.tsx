import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Star } from "lucide-react";
import { CollectorApp } from "@/layouts/collector-app";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { wasteTypeMeta } from "@/lib/mock-data";

export const Route = createFileRoute("/collector/history")({
  head: () => ({ meta: [{ title: "History — BorlaGo" }] }),
  component: () => (
    <CollectorApp>
      <History />
    </CollectorApp>
  ),
});

const history = [
  { id: "h1", ref: "BG-7610", stream: "organic" as const, date: "Jun 18 · 09:12", payout: 9, rating: 5, customer: "Alex Mensah" },
  { id: "h2", ref: "BG-7588", stream: "general" as const, date: "Jun 15 · 16:40", payout: 12, rating: 5, customer: "Efua Sarpong" },
  { id: "h3", ref: "BG-7521", stream: "recycling" as const, date: "Jun 14 · 11:05", payout: 6, rating: 4, customer: "Nana Adjei" },
  { id: "h4", ref: "BG-7498", stream: "bulky" as const, date: "Jun 12 · 14:22", payout: 22, rating: 5, customer: "Yaw Boateng" },
];

function History() {
  return (
    <div className="space-y-6">
      <PageHeader title="Collection history" subtitle="Your completed jobs and ratings." />
      <Card>
        <div className="divide-y divide-border">
          {history.map((h) => (
            <div key={h.id} className="flex flex-wrap items-center gap-4 p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/12 text-success"><CheckCircle2 className="h-5 w-5" /></span>
              <div className="min-w-0">
                <p className="font-semibold">{wasteTypeMeta[h.stream].label}</p>
                <p className="text-sm text-muted-foreground">{h.ref} · {h.customer} · {h.date}</p>
              </div>
              <div className="ml-auto flex items-center gap-4">
                <span className="flex items-center gap-1 text-sm">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < h.rating ? "fill-warning text-warning" : "text-muted-foreground/30"}`} />
                  ))}
                </span>
                <span className="font-display text-lg font-bold text-primary">${h.payout}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
