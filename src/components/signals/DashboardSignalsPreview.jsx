import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Radar, ArrowRight, TrendingUp, Minus, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";

const trendIcons = { growing: TrendingUp, stable: Minus, fading: TrendingDown };
const trendColors = { growing: "text-green-400", stable: "text-blue-400", fading: "text-muted-foreground" };

export default function DashboardSignalsPreview() {
  const { data: signals = [] } = useQuery({
    queryKey: ["signals-preview"],
    queryFn: () => base44.entities.Signal.filter({ status: "active" }, "-last_seen", 3),
  });

  if (signals.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-primary" />
          <h2 className="font-display text-lg text-foreground">Emerging Signals</h2>
        </div>
        <Link to="/signals" className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          View all <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid gap-2">
        {signals.map(s => {
          const TrendIcon = trendIcons[s.trend] || Minus;
          return (
            <Link
              key={s.id}
              to={`/signal/${s.id}`}
              className="p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-primary/20 transition-all group flex items-center justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{s.name}</p>
                <p className="text-xs text-muted-foreground truncate">{s.summary}</p>
              </div>
              <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                <span className="text-[11px] text-muted-foreground">{s.related_extraction_ids?.length || 0}</span>
                <TrendIcon className={`w-3.5 h-3.5 ${trendColors[s.trend] || "text-muted-foreground"}`} />
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}