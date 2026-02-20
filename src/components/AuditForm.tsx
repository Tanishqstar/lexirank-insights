import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface AuditFormProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
}

const AuditForm = ({ onSubmit, isLoading }: AuditFormProps) => {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative"
    >
      <div className="glass-card rounded-xl flex items-center gap-3 p-2 focus-within:border-primary/30 focus-within:glow-primary transition-all">
        <div className="pl-3 text-muted-foreground">
          <Search className="h-5 w-5" />
        </div>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL to audit (e.g. https://example.com)"
          className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm py-2"
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium text-sm flex items-center gap-2 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Audit
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.form>
  );
};

export default AuditForm;
