import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Search, Brain, Database } from "lucide-react";

interface ScanProgressProps {
  step: number; // 0=idle, 1=fetching, 2=analyzing, 3=saving
  isVisible: boolean;
}

const steps = [
  { icon: Search, label: "Fetching content...", description: "Extracting page data" },
  { icon: Brain, label: "AI Analysis...", description: "Running SEO & readability checks" },
  { icon: Database, label: "Saving results...", description: "Storing audit report" },
];

const ScanProgress = ({ step, isVisible }: ScanProgressProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="glass-card rounded-xl p-6 space-y-4"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            Scanning in progress
          </div>

          <div className="space-y-3">
            {steps.map((s, i) => {
              const Icon = s.icon;
              const isActive = step === i + 1;
              const isComplete = step > i + 1;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                    isActive ? "bg-primary/5 border border-primary/20" : isComplete ? "opacity-50" : "opacity-30"
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : isComplete ? "bg-primary/5 text-primary" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.label}</p>
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  </div>
                  {isComplete && (
                    <div className="ml-auto text-xs text-primary font-medium">Done</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Animated scan bar */}
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary/40 via-primary to-primary/40 rounded-full"
              animate={{ x: ["-100%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ width: "50%" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ScanProgress;
