import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight } from "lucide-react";
import { format } from "date-fns";

const STATUS_CONFIG = {
  "Published":                  { color: "text-emerald-400",      dot: "bg-emerald-400",      bar: "bg-emerald-400" },
  "Completed":                  { color: "text-sky-400",           dot: "bg-sky-400",           bar: "bg-sky-400" },
  "In Progress":                { color: "text-amber-400",         dot: "bg-amber-400",         bar: "bg-amber-400" },
  "Scheduled":                  { color: "text-violet-400",        dot: "bg-violet-400",        bar: "bg-violet-400" },
  "Merged Into Another Project":{ color: "text-indigo-400",        dot: "bg-indigo-400",        bar: "bg-indigo-400" },
  "Still Exploring":            { color: "text-primary",           dot: "bg-primary",           bar: "bg-primary" },
  "Abandoned":                  { color: "text-rose-400",          dot: "bg-rose-400",          bar: "bg-rose-400" },
  "Archived":                   { color: "text-muted-foreground",  dot: "bg-muted-foreground",  bar: "bg-muted-foreground" },
};

// Statuses that represent a "closed loop" (idea reached an outcome)
const CLOSED_STATUSES = new Set(["Published", "Completed", "Merged Into Another Project", "Abandoned", "Archived"]);
const ACTIVE_STATUSES = new Set(["In Progress", "Scheduled"]);

function TrajectoryRow({ extraction, index }) {
  const outcome = extraction.outcome;
  const cfg = outcome?.status ? STATUS_CONFIG[outcome.status] : null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={`/extraction/${extraction.id}`}
        className="flex items-center gap-3 p-3 rounded-lg border border-border/25 bg-card/30 hover:border-border/50 hover:bg-card/60 transition-all group"
      >
        {/* Status indicator */}
        <div className="flex-shrink-0">
          {cfg ? (
            <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          ) : (
            <Circle className="w-3.5 h-3.5 text-border" />
          )}
        </div>

        {/* Title + asset */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors line-clamp-1">
            {extraction.title}
          </p>
          {outcome?.asset_title && (
            <p className={`text-[10px] mt-0.5 truncate ${cfg?.color || "text-muted-foreground"}`}>
              → {outcome.asset_title}
            </p>
          )}
        </div>

        {/* Status label */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {cfg ? (
            <span className={`text-[10px] font-medium ${cfg.color}`}>{outcome.status}</span>
          ) : (
            <span className="text-[10px] text-muted-foreground/40 italic">No outcome yet</span>
          )}
          <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </Link>
    </motion.div>
  );
}

export default function OutcomeTracker({ extractions = [] }) {
  const { withOutcome, withoutOutcome, closed, active, statusBreakdown } = useMemo(() => {
    const withOutcome = extractions.filter(e => e.outcome?.status);
    const withoutOutcome = extractions.filter(e => !e.outcome?.status);
    const closed = withOutcome.filter(e => CLOSED_STATUSES.has(e.outcome.status));
    const active = withOutcome.filter(e => ACTIVE_STATUSES.has(e.outcome.status));

    const breakdown = {};
    withOutcome.forEach(e => {
      const s = e.outcome.status;
      if (!breakdown[s]) breakdown[s] = 0;
      breakdown[s]++;
    });

    return { withOutcome, withoutOutcome, closed, active, statusBreakdown: breakdown };
  }, [extractions]);

  // Show the 8 most recent extractions sorted: with outcome first, then by date
  const displayList = useMemo(() => {
    const sorted = [...extractions].sort((a, b) => {
      const aHas = !!a.outcome?.status;
      const bHas = !!b.outcome?.status;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;
      return new Date(b.created_date) - new Date(a.created_date);
    });
    return sorted.slice(0, 8);
  }, [extractions]);

  return (
    <div className="space-y-4">
      {/* Header row with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h3 className="font-display text-base text-foreground">Idea Trajectories</h3>
          <span className="text-[10px] text-muted-foreground/50 font-mono ml-1">discovery → outcome</span>
        </div>
        <Link to="/outcomes" className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors">
          Full Outcomes →
        </Link>
      </div>

      {/* Progress bar: breakdown by status */}
      {withOutcome.length > 0 && (
        <div className="space-y-2">
          <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted/40 gap-px">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              const pct = (count / extractions.length) * 100;
              return (
                <motion.div
                  key={status}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className={`h-full ${cfg?.bar || "bg-muted"}`}
                  title={`${status}: ${count}`}
                />
              );
            })}
            {/* Remainder (no outcome) */}
            {withoutOutcome.length > 0 && (
              <div
                className="h-full bg-muted/30 flex-1"
                title={`No outcome: ${withoutOutcome.length}`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {Object.entries(statusBreakdown).map(([status, count]) => {
              const cfg = STATUS_CONFIG[status];
              return (
                <div key={status} className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg?.dot || "bg-muted"}`} />
                  <span className="text-[10px] text-muted-foreground/60">{status} ({count})</span>
                </div>
              );
            })}
            {withoutOutcome.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/25" />
                <span className="text-[10px] text-muted-foreground/40">Untracked ({withoutOutcome.length})</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-lg bg-muted/20 border border-border/20 text-center">
          <p className="text-xl font-display text-foreground">{extractions.length}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Extracted</p>
        </div>
        <div className="p-3 rounded-lg bg-emerald-400/5 border border-emerald-400/15 text-center">
          <p className="text-xl font-display text-emerald-400">{closed.length}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">Closed</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/15 text-center">
          <p className="text-xl font-display text-amber-400">{active.length}</p>
          <p className="text-[10px] text-muted-foreground/60 mt-0.5">In Flight</p>
        </div>
      </div>

      {/* Trajectory list */}
      <div className="space-y-1.5">
        {displayList.map((e, i) => (
          <TrajectoryRow key={e.id} extraction={e} index={i} />
        ))}
      </div>

      {extractions.length > 8 && (
        <Link to="/workspace" className="text-xs text-muted-foreground/50 hover:text-primary transition-colors block text-right">
          View all {extractions.length} extractions →
        </Link>
      )}
    </div>
  );
}