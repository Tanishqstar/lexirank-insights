import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface ReadabilityChartProps {
  readabilityScore: number;
  seoScore: number;
}

const ReadabilityChart = ({ readabilityScore, seoScore }: ReadabilityChartProps) => {
  const data = [
    { name: "Readability", score: readabilityScore },
    { name: "SEO", score: seoScore },
    { name: "Keywords", score: Math.round((readabilityScore + seoScore) / 2.2) },
    { name: "Structure", score: Math.round(seoScore * 0.85) },
  ];

  const getBarColor = (score: number) => {
    if (score >= 70) return "hsl(var(--score-high))";
    if (score >= 40) return "hsl(var(--score-medium))";
    return "hsl(var(--score-low))";
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} barCategoryGap="25%">
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
            color: "hsl(var(--foreground))",
          }}
        />
        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={index} fill={getBarColor(entry.score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ReadabilityChart;
