// src/routes/admin.reports.tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileText, Download, Calendar, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AdminApp } from "@/layouts/admin-app";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/reports")({
  head: () => ({ meta: [{ title: "Reports — BorlaGo Admin" }, { name: "robots", content: "noindex" }] }),
  component: () => (
    <AdminApp>
      <AdminReports />
    </AdminApp>
  ),
});

const reportsList = [
  { id: "operations", name: "Monthly operations summary", desc: "Bookings counts, breakdown matrix, and overall task volumes", period: "June 2026" },
  { id: "financials", name: "Financial reconciliation", desc: "Gross platform margins, estimated payouts distribution, and baseline averages", period: "June 2026" },
];

function AdminReports() {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const compileAndDownloadReport = async (reportId: string, reportName: string) => {
    setDownloadingId(reportId);
    toast.loading(`Compiling live operational matrix for ${reportName}...`, { id: "report-toast" });

    try {
      // Pull down the main operational datasets for live calculation
      const { data: pickups, error } = await supabase
        .from("pickups")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const dataRows = pickups || [];

      let exportPayload: Record<string, any> = {
        generatedAt: new Date().toISOString(),
        platform: "BorlaGo Admin Infrastructure Ecosystem",
        scope: "June 2026 Lifecycle Telemetry",
        totalRecordsEvaluated: dataRows.length,
      };

      // Triage analytics sorting based on the selection
      if (reportId === "operations") {
        const completed = dataRows.filter(p => p.status === "completed").length;
        const pending = dataRows.filter(p => p.status === "pending").length;
        const cancelled = dataRows.filter(p => p.status === "cancelled").length;
        
        const typeBreakdown = dataRows.reduce((acc: Record<string, number>, p) => {
          acc[p.waste_type] = (acc[p.waste_type] || 0) + 1;
          return acc;
        }, {});

        exportPayload.metrics = {
          completedRuns: completed,
          pendingTriage: pending,
          cancelledRuns: cancelled,
          completionRate: dataRows.length ? `${Math.round((completed / dataRows.length) * 100)}%` : "0%",
          wasteStreamDistribution: typeBreakdown,
        };
      } else if (reportId === "financials") {
        const grossVolume = dataRows
          .filter(p => p.status === "completed")
          .reduce((sum, p) => sum + (p.price || 15), 0);

        exportPayload.metrics = {
          grossPlatformVolumeGHS: grossVolume,
          estimatedCollectorPayouts: Math.round(grossVolume * 0.65),
          retainedPlatformRevenue: Math.round(grossVolume * 0.35),
          averageTicketPrice: dataRows.length ? Math.round(grossVolume / dataRows.length) : 0,
        };
      }

      // Convert payload array to a downloadable file attachment blob
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(exportPayload, null, 2))}`;
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", `BorlaGo_${reportId}_report_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      toast.success("Download started successfully!", { id: "report-toast" });
    } catch (err) {
      console.error("❌ Analytics Compilation Exception:", err);
      toast.error("Failed compiling report metadata assets", { id: "report-toast" });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Compile, review, and extract systemic ecosystem telemetry."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {reportsList.map((r) => (
          <Card key={r.id} className="flex items-start gap-4 p-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-6 w-6" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{r.name}</p>
              <p className="text-sm text-muted-foreground">{r.desc}</p>
              <p className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" /> {r.period} · Live DB Engine
              </p>
            </div>
            <Button 
              variant="outline" 
              size="icon" 
              disabled={downloadingId !== null}
              onClick={() => compileAndDownloadReport(r.id, r.name)}
            >
              {downloadingId === r.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}