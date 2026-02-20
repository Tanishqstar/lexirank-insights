import { motion } from "framer-motion";
import ScoreRing from "./ScoreRing";
import ReadabilityChart from "./ReadabilityChart";
import FindingsList, { type Finding } from "./FindingsList";
import { TrendingUp, Eye, AlertTriangle } from "lucide-react";

interface AuditData {
  url: string;
  overall_score: number;
  readability_score: number;
  seo_score: number;
  readability_level: string;
  findings: Finding[];
  keywords: { term: string; density: string }[];
}

interface DashboardBentoProps {
  audit: AuditData;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const DashboardBento = ({ audit }: DashboardBentoProps) => {
  const highPriority = audit.findings.filter((f) => f.priority === "High");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Card A: Overall Score */}
      <motion.div
        custom={0}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center lg:row-span-2"
      >
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <TrendingUp className="h-3.5 w-3.5" />
          Overall Score
        </div>
        <ScoreRing score={audit.overall_score} size={180} label="" />
        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-foreground">{audit.url}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Reading level: <span className="text-foreground font-medium">{audit.readability_level}</span>
          </p>
        </div>
      </motion.div>

      {/* Card B: Readability & SEO Metrics */}
      <motion.div
        custom={1}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-2xl p-6 lg:col-span-2"
      >
        <div className="flex items-center gap-2 mb-4 text-xs font-medium text-muted-foreground uppercase tracking-wider">
          <Eye className="h-3.5 w-3.5" />
          Content Metrics
        </div>
        <ReadabilityChart readabilityScore={audit.readability_score} seoScore={audit.seo_score} />
      </motion.div>

      {/* Card C: Priority Feed */}
      <motion.div
        custom={2}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="glass-card rounded-2xl p-6 lg:col-span-2"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            <AlertTriangle className="h-3.5 w-3.5" />
            Findings
          </div>
          {highPriority.length > 0 && (
            <span className="text-xs font-medium text-destructive">
              {highPriority.length} high priority
            </span>
          )}
        </div>
        <FindingsList findings={audit.findings} />
      </motion.div>

      {/* Card D: Keywords */}
      {audit.keywords.length > 0 && (
        <motion.div
          custom={3}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          className="glass-card rounded-2xl p-6 hidden lg:block"
        >
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-4">
            Top Keywords
          </div>
          <div className="space-y-3">
            {audit.keywords.slice(0, 6).map((kw, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-foreground">{kw.term}</span>
                <span className="text-xs text-muted-foreground font-mono">{kw.density}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default DashboardBento;
