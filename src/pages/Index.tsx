import { useState, useRef } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AuditForm from "@/components/AuditForm";
import ScanProgress from "@/components/ScanProgress";
import DashboardBento from "@/components/DashboardBento";
import EmptyState from "@/components/EmptyState";
import type { Finding } from "@/components/FindingsList";
import { motion } from "framer-motion";

// Demo data for first version (will be replaced by real AI analysis)
const demoAudit = {
  url: "https://example.com",
  overall_score: 72,
  readability_score: 78,
  seo_score: 65,
  readability_level: "Grade 8 — Good",
  keywords: [
    { term: "content marketing", density: "2.4%" },
    { term: "SEO optimization", density: "1.8%" },
    { term: "digital strategy", density: "1.2%" },
    { term: "user experience", density: "0.9%" },
    { term: "conversion rate", density: "0.7%" },
  ],
  findings: [
    { id: "1", type: "SEO" as const, issue_description: "Missing meta description — add a compelling 155-character summary", priority: "High" as const },
    { id: "2", type: "SEO" as const, issue_description: "No H1 tag found on the page — add a primary heading", priority: "High" as const },
    { id: "3", type: "Readability" as const, issue_description: "Average sentence length is 28 words — aim for under 20", priority: "Medium" as const },
    { id: "4", type: "SEO" as const, issue_description: "Images missing alt attributes (3 of 7)", priority: "Medium" as const },
    { id: "5", type: "Readability" as const, issue_description: "Passive voice used in 18% of sentences — reduce to under 10%", priority: "Low" as const },
    { id: "6", type: "SEO" as const, issue_description: "No canonical tag specified", priority: "Low" as const },
  ] as Finding[],
};

const Index = () => {
  const [audit, setAudit] = useState<typeof demoAudit | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const formRef = useRef<HTMLDivElement>(null);

  const handleAudit = async (url: string) => {
    setIsScanning(true);
    setAudit(null);
    setScanStep(1);

    // Simulate multi-step scan
    await new Promise((r) => setTimeout(r, 1500));
    setScanStep(2);
    await new Promise((r) => setTimeout(r, 2000));
    setScanStep(3);
    await new Promise((r) => setTimeout(r, 1000));

    setAudit({ ...demoAudit, url });
    setIsScanning(false);
    setScanStep(0);
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
