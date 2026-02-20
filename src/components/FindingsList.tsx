import { motion } from "framer-motion";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";
import PriorityBadge from "./PriorityBadge";

export interface Finding {
  id: string;
  type: "SEO" | "Readability";
  issue_description: string;
  priority: "High" | "Medium" | "Low";
}

interface FindingsListProps {
  findings: Finding[];
}

const iconMap = {
  High: AlertTriangle,
  Medium: Info,
  Low: CheckCircle,
};

const FindingsList = ({ findings }: FindingsListProps) => {
  const sorted = [...findings].sort((a, b) => {
    const order = { High: 0, Medium: 1, Low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
      {sorted.map((f, i) => {
        const Icon = iconMap[f.priority];
        return (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <Icon
              className={`h-4 w-4 mt-0.5 shrink-0 ${
                f.priority === "High" ? "text-destructive" : f.priority === "Medium" ? "text-score-medium" : "text-primary"
              }`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground leading-snug">{f.issue_description}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-muted-foreground">{f.type}</span>
                <PriorityBadge priority={f.priority} />
              </div>
            </div>
          </motion.div>
        );
      })}
      {findings.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">No findings yet</p>
      )}
    </div>
  );
};

export default FindingsList;
