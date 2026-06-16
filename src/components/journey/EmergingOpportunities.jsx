import { useMemo } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function EmergingOpportunities({ extractions, mission, inProgress }) {
  const opportunities = useMemo(() => {
    const groups = [];

    // Undeveloped extractions (active, no outcome or "Still Exploring")
    const undeveloped = extractions.filter(e =>
      (!e.status || e.status === "active") &&
      (!e.outcome?.status || e.outcome.status === "Still Exploring")
    );

    // With strong dev signals
    const withDevSignals = undeveloped.filter(e => e.development_signals?.most_likely_next_step);
    if (withDevSignals.length > 0) {
      groups.push({
        label: `${withDevSignals.length} ${withDevSignals.length === 1 ? "discovery has" : "discoveries have"} clear development signals but haven't been started yet.`,
        items: withDevSignals.slice(0, 3),
        color: "text-violet-400",
        bg: "bg-violet-400/5",
        border: "border-violet-400/15",
        dot: "bg-violet-400",
      });
    }

    // Archived extractions with dev signals — potential second looks
    const archivedWithSignals = extractions.filter(e =>
      e.status === "archived" && e.development_signals?.most_likely_next_step
    );
    if (archivedWithSignals.length > 0) {
      groups.push({
        label: `${archivedWithSignals.length} archived ${archivedWithSignals.length === 1 ? "discovery" : "discoveries"} may deserve another look — they contain development signals.`,
        items: archivedWithSignals.slice(0, 3),
        color: "text-amber-400",
        bg: "bg-amber-400/5",
        border: "border-amber-400/15",
        dot: "bg-amber-400",
      });
    }

    // Mission-aligned: match against goal keywords
    if (mission?.immediate_goals?.length > 0) {
      const goalKeywords = mission.immediate_goals.flatMap(g => g.toLowerCase().split(/\s+/)).filter(w => w.length > 4);
      const aligned = undeveloped.filter(e => {
        const text = `${e.title} ${e.core_insight || ""} ${(e.suggested_tags || []).join(" ")}`.toLowerCase();
        return goalKeywords.some(kw => text.includes(kw));
      });
      if (aligned.length > 0) {
        groups.push({
          label: `${aligned.length} ${aligned.length === 1 ? "discovery appears" : "discoveries appear"} aligned with your current mission goals but haven't been developed.`,
          items: aligned.slice(0, 3),
          color: "text-primary",
          bg: "bg-primary/5",
          border: "border-primary/15",
          dot: "bg-primary",
        });
      }
    }

    return groups;
  }, [extractions, mission]);

  if (opportunities.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-amber-400" />
        <h2 className="font-display text-lg text-foreground">Emerging Opportunities</h2>
      </div>
      <div className="space-y-3">
        {opportunities.map((opp, i) => (
          <div key={i} className={`p-4 rounded-xl border ${opp.border} ${opp.bg}`}>
            <p className={`text-sm font-medium ${opp.color} mb-3`}>{opp.label}</p>
            <div className="space-y-1.5">
              {opp.items.map(e => (
                <Link
                  key={e.id}
                  to={`/extraction/${e.id}`}
                  className="flex items-center justify-between group px-3 py-2 rounded-lg bg-card/40 hover:bg-card/80 border border-border/20 hover:border-border/40 transition-all"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${opp.dot} flex-shrink-0`} />
                    <span className="text-xs text-foreground/80 truncate group-hover:text-foreground transition-colors">{e.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}