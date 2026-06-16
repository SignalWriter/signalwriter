import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const STATUS_STYLE = {
  "Published":  { icon: "✅", color: "text-emerald-400", border: "border-emerald-400/20", bg: "bg-emerald-400/5" },
  "Completed":  { icon: "✅", color: "text-sky-400",     border: "border-sky-400/20",     bg: "bg-sky-400/5" },
  "Launched":   { icon: "🚀", color: "text-violet-400",  border: "border-violet-400/20",  bg: "bg-violet-400/5" },
};

function JourneyStep({ label, value, isLast }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-col items-center">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        {!isLast && <div className="w-px h-4 bg-border/40 mt-0.5" />}
      </div>
      <div className="pb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/60">{label}</p>
        <p className="text-xs text-foreground/80">{value}</p>
      </div>
    </div>
  );
}

export default function RecentWins({ completed, onSelect }) {
  if (completed.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <h2 className="font-display text-lg text-foreground">Recent Wins</h2>
        </div>
        <div className="text-center py-10 border border-border/20 rounded-xl bg-card/30">
          <p className="text-sm text-muted-foreground/60">No completed outcomes yet.</p>
          <p className="text-xs text-muted-foreground/40 mt-1">Record an outcome on any extraction to see it here.</p>
        </div>
      </motion.div>
    );
  }

  const recent = [...completed]
    .sort((a, b) => new Date(b.outcome?.recorded_at || b.updated_date) - new Date(a.outcome?.recorded_at || a.updated_date))
    .slice(0, 8);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        <h2 className="font-display text-lg text-foreground">Recent Wins</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recent.map((e, i) => {
          const st = STATUS_STYLE[e.outcome.status] || STATUS_STYLE["Completed"];
          const steps = [
            { label: "Origin", value: e.source_type?.replace("_", " ") || "Conversation" },
            { label: "Extraction", value: e.title },
            ...(e.development_signals?.most_likely_next_step ? [{ label: "Development", value: e.development_signals.most_likely_next_step }] : []),
            { label: e.outcome.status, value: e.outcome.asset_title || e.title },
          ];
          return (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`p-4 rounded-xl border ${st.border} ${st.bg} cursor-pointer hover:border-opacity-60 transition-all group`}
              onClick={() => onSelect(e)}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-sm">{st.icon}</span>
                    <span className={`text-xs font-medium ${st.color}`}>{e.outcome.status}</span>
                  </div>
                  <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    {e.outcome.asset_title || e.title}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  {e.outcome.url && (
                    <a
                      href={e.outcome.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={ev => ev.stopPropagation()}
                      className="text-primary/50 hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary transition-colors" />
                </div>
              </div>
              {/* Mini journey path */}
              <div className="space-y-0">
                {steps.map((step, si) => (
                  <JourneyStep key={si} label={step.label} value={step.value} isLast={si === steps.length - 1} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}