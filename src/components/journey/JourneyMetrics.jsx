import { useMemo } from "react";
import { motion } from "framer-motion";

function Metric({ label, value, color = "text-foreground" }) {
  return (
    <div className="p-4 rounded-xl border border-border/30 bg-card/50 space-y-1">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className={`text-3xl font-display ${color}`}>{value}</p>
    </div>
  );
}

export default function JourneyMetrics({ extractions }) {
  const metrics = useMemo(() => {
    const total = extractions.length;
    const devSignals = extractions.filter(e => e.development_signals?.most_likely_next_step).length;
    const draftsStarted = extractions.filter(e =>
      ["In Progress", "Scheduled"].includes(e.outcome?.status)
    ).length;
    const inProgress = extractions.filter(e => e.outcome?.status === "In Progress").length;
    const completed = extractions.filter(e =>
      ["Completed", "Published"].includes(e.outcome?.status)
    ).length;
    const published = extractions.filter(e => e.outcome?.status === "Published").length;
    return { total, devSignals, draftsStarted, inProgress, completed, published };
  }, [extractions]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <h2 className="font-display text-lg text-foreground">Journey Metrics</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Metric label="Discoveries" value={metrics.total} />
        <Metric label="Dev Signals" value={metrics.devSignals} color="text-violet-400" />
        <Metric label="Drafts Started" value={metrics.draftsStarted} color="text-amber-400" />
        <Metric label="In Progress" value={metrics.inProgress} color="text-amber-400" />
        <Metric label="Completed" value={metrics.completed} color="text-sky-400" />
        <Metric label="Published" value={metrics.published} color="text-emerald-400" />
      </div>
    </motion.div>
  );
}