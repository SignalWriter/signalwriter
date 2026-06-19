import { Link } from "react-router-dom";
import { TrendingUp, Minus, TrendingDown, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

const trendConfig = {
  growing: { icon: TrendingUp, label: "Growing", color: "text-green-400" },
  stable: { icon: Minus, label: "Stable", color: "text-blue-400" },
  fading: { icon: TrendingDown, label: "Fading", color: "text-muted-foreground" },
};

export default function SignalCard({ signal, index = 0 }) {
  const trend = trendConfig[signal.trend] || trendConfig.stable;
  const TrendIcon = trend.icon;
  const count = signal.related_extraction_ids?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link
        to={`/signal/${signal.id}`}
        className="block p-5 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-primary/30 transition-all group"
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-display text-lg text-foreground group-hover:text-primary transition-colors">
            {signal.name}
          </h3>
          <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-1 flex-shrink-0" />
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{signal.summary}</p>
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground flex-wrap">
          <span className="font-medium text-foreground/80">{count} extraction{count !== 1 ? "s" : ""}</span>
          <span>·</span>
          <span className={`flex items-center gap-1 ${trend.color}`}>
            <TrendIcon className="w-3 h-3" />
            {trend.label}
          </span>
          {signal.first_seen && (
            <>
              <span>·</span>
              <span>Since {format(new Date(signal.first_seen), "MMM yyyy")}</span>
            </>
          )}
        </div>
      </Link>
    </motion.div>
  );
}