import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface EmptyStateProps {
  onStartAudit: () => void;
}

const EmptyState = ({ onStartAudit }: EmptyStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 glow-primary">
        <Search className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground mb-2">Start your first audit</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Enter a URL above to analyze your content for SEO gaps, readability issues, and keyword optimization.
      </p>
      <button
        onClick={onStartAudit}
        className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors glow-primary"
      >
        Run your first audit
      </button>
    </motion.div>
  );
};

export default EmptyState;
