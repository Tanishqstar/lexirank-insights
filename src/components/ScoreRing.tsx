import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 70) return "hsl(var(--score-high))";
  if (score >= 40) return "hsl(var(--score-medium))";
  return "hsl(var(--score-low))";
};

const ScoreRing = ({ score, size = 160, label = "Overall" }: ScoreRingProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedScore / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getScoreColor(score)}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="score-ring"
            style={{ filter: `drop-shadow(0 0 8px ${getScoreColor(score)}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-4xl font-bold text-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {animatedScore}
          </motion.span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">/100</span>
        </div>
      </div>
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
    </div>
  );
};

export default ScoreRing;
