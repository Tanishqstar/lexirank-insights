import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Calendar, ExternalLink, Trash2 } from "lucide-react";
import ScoreRing from "@/components/ScoreRing";
import PriorityBadge from "@/components/PriorityBadge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface AuditRow {
  id: string;
  url: string;
  overall_score: number | null;
  readability_score: number | null;
  seo_score: number | null;
  readability_level: string | null;
  status: string;
  created_at: string;
  findings_count?: number;
}

const History = () => {
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAudits = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("audits")
      .select("*, audit_findings(id)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load audit history");
      console.error(error);
    } else {
      setAudits(
        (data || []).map((a: any) => ({
          ...a,
          findings_count: a.audit_findings?.length ?? 0,
        }))
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAudits();
  }, []);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("audits").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete audit");
    } else {
      setAudits((prev) => prev.filter((a) => a.id !== id));
      toast.success("Audit deleted");
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const truncateUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname + (u.pathname.length > 1 ? u.pathname.slice(0, 30) : "");
    } catch {
      return url.slice(0, 40);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border/50">
            <div className="flex items-center h-14 px-6 gap-4">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold text-foreground">History</h1>
            </div>
          </header>

          <div className="p-6 max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="bg-card/60 backdrop-blur-lg border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    Past Audits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-14 w-full rounded-md" />
                      ))}
                    </div>
                  ) : audits.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-12">
                      No audits yet. Run your first audit from the Dashboard.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead className="text-center">Overall</TableHead>
                            <TableHead className="text-center">SEO</TableHead>
                            <TableHead className="text-center">Readability</TableHead>
                            <TableHead className="text-center">Findings</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead className="w-10" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {audits.map((audit, idx) => (
                            <motion.tr
                              key={audit.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.04 }}
                              className="border-b transition-colors data-[state=selected]:bg-muted hover:bg-muted/50"
                            >
                              <TableCell>
                                <a
                                  href={audit.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1.5 text-primary hover:underline text-sm font-medium"
                                >
                                  {truncateUrl(audit.url)}
                                  <ExternalLink className="h-3 w-3 shrink-0" />
                                </a>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex justify-center">
                                  <ScoreRing score={audit.overall_score ?? 0} size={40} />
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm font-semibold text-foreground">
                                  {audit.seo_score ?? "—"}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex flex-col items-center gap-0.5">
                                  <span className="text-sm font-semibold text-foreground">
                                    {audit.readability_score ?? "—"}
                                  </span>
                                  {audit.readability_level && (
                                    <span className="text-[10px] text-muted-foreground">
                                      {audit.readability_level}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">
                                <span className="text-sm text-muted-foreground">
                                  {audit.findings_count}
                                </span>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatDate(audit.created_at)}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleDelete(audit.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </motion.tr>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default History;
