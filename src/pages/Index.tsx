import { useState, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AuditForm from "@/components/AuditForm";
import ScanProgress from "@/components/ScanProgress";
import DashboardBento from "@/components/DashboardBento";
import EmptyState from "@/components/EmptyState";
import type { Finding } from "@/components/FindingsList";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AuditResult {
  url: string;
  overall_score: number;
  readability_score: number;
  seo_score: number;
  readability_level: string;
  keywords: { term: string; density: string }[];
  findings: Finding[];
}

const Index = () => {
  const [audit, setAudit] = useState<AuditResult | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const handleAudit = async (url: string) => {
    setIsScanning(true);
    setAudit(null);
    setScanStep(1);

    try {
      // Step 1: Fetching page
      await new Promise((r) => setTimeout(r, 800));
      setScanStep(2);

      // Step 2: AI Analysis (actual call)
      const { data, error } = await supabase.functions.invoke("analyze-url", {
        body: { url },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || "Analysis failed");

      setScanStep(3);
      await new Promise((r) => setTimeout(r, 600));

      setAudit(data.data);
    } catch (err: any) {
      console.error("Audit failed:", err);
      toast.error(err.message || "Failed to analyze URL. Please try again.");
    } finally {
      setIsScanning(false);
      setScanStep(0);
    }
  };

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 backdrop-blur-lg bg-background/80 border-b border-border/50">
            <div className="flex items-center h-14 px-6 gap-4">
              <SidebarTrigger />
              <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
            </div>
          </header>

          {/* Content */}
          <div className="p-6 max-w-6xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div ref={formRef}>
                <AuditForm onSubmit={handleAudit} isLoading={isScanning} />
              </div>
            </motion.div>

            <ScanProgress step={scanStep} isVisible={isScanning} />

            {audit && !isScanning && <DashboardBento audit={audit} />}

            {!audit && !isScanning && <EmptyState onStartAudit={scrollToForm} />}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;
