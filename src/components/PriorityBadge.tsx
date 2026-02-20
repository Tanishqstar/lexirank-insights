import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: "High" | "Medium" | "Low";
}

const PriorityBadge = ({ priority }: PriorityBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        priority === "High" && "bg-destructive/10 text-destructive",
        priority === "Medium" && "bg-score-medium/10 text-score-medium",
        priority === "Low" && "bg-primary/10 text-primary"
      )}
    >
      {priority}
    </span>
  );
};

export default PriorityBadge;
