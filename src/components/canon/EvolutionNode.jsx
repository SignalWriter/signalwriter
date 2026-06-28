import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ChevronDown, ChevronUp, Sparkles, AlertTriangle, GitBranch } from "lucide-react";

const CATEGORY_COLORS = {
  Character: "bg-purple-400/10 text-purple-400",
  Concept: "bg-blue-400/10 text-blue-400",
  Terminology: "bg-cyan-400/10 text-cyan-400",
  Location: "bg-green-400/10 text-green-400",
  System: "bg-indigo-400/10 text-indigo-400",
  Relationship: "bg-pink-400/10 text-pink-400",
  Rule: "bg-orange-400/10 text-orange-400",
  Theme: "bg-amber-400/10 text-amber-400",
  Framework: "bg-teal-400/10 text-teal-400",
  Other: "bg-muted text-muted-foreground",
};

export default function EvolutionNode({ update, index, total, prevUpdate }) {
  const [expanded, setExpanded] = useState(false);

  const newEntries = update.new_canon_entries || [];
  const deltaEntries = update.canon_updates || [];
  const hasContradictions = !!update.contradictions;
  const hasDetail = newEntries.length > 0 || deltaEntries.length > 0 || hasContradictions || update.mira_note;
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="relative pl-8 pb-6"
    >
      {/* Node dot */}
      <div className={`absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full flex items-center justify-center border-2 z-10
        ${isLast ? "border-primary bg-primary/10" : "border-border bg-background"}`}>
        <div className={`w-2 h-2 rounded-full ${isLast ? "bg-primary" : "bg-muted-foreground/40"}`} />
      </div>

      {/* Card */}
      <div className="rounded-xl border border-border/40 bg-card/30 hover:border-border/60 transition-colors overflow-hidden">
        <div className="px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-muted-foreground/60 bg-muted/40 px-2 py-0.5 rounded">
                  {update.created_date ? format(new Date(update.created_date), "MMM d, yyyy") : "Unknown date"}
                </span>
                {newEntries.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                    <Sparkles className="w-2.5 h-2.5" />
                    +{newEntries.length} new concept{newEntries.length > 1 ? "s" : ""}
                  </span>
                )}
                {deltaEntries.length > 0 && (
                  <span className="flex items-center gap-1 text-[10px] text-blue-400">
                    <GitBranch className="w-2.5 h-2.5" />
                    {deltaEntries.length} evolved
                  </span>
                )}
                {hasContradictions && (
                  <span className="flex items-center gap-1 text-[10px] text-amber-400">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    tension
                  </span>
                )}
              </div>

              {update.canon_changes && (
                <p className="text-sm text-foreground/80 leading-relaxed line-clamp-2">{update.canon_changes}</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link to={`/canon-result/${update.id}`} className="text-[10px] text-primary/50 hover:text-primary transition-colors">view →</Link>
              {hasDetail && (
                <button onClick={() => setExpanded(v => !v)} className="text-muted-foreground/40 hover:text-muted-foreground transition-colors">
                  {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expandable detail */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 border-t border-border/20 space-y-4">

                {/* New Entries */}
                {newEntries.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">New Canon Entries</p>
                    <div className="flex flex-wrap gap-1.5">
                      {newEntries.map((entry, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.Other}`}>
                          {entry.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deltas */}
                {deltaEntries.length > 0 && (
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">What Evolved</p>
                    <div className="space-y-1.5">
                      {deltaEntries.map((d, i) => (
                        <div key={i} className="text-xs text-foreground/70">
                          <span className="text-muted-foreground font-medium">{d.name}:</span> <span className="text-foreground/60">{d.delta}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contradictions */}
                {hasContradictions && (
                  <div className="p-3 rounded-lg bg-amber-400/5 border border-amber-400/15">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-amber-400/70 mb-1">Tension / Contradiction</p>
                    <p className="text-xs text-foreground/70 leading-relaxed line-clamp-3">{update.contradictions}</p>
                  </div>
                )}

                {/* MIRA Note */}
                {update.mira_note && (
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                    <p className="text-[10px] uppercase tracking-[0.12em] text-primary/50 mb-1">MIRA</p>
                    <p className="text-xs text-foreground/70 italic leading-relaxed">{update.mira_note}</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}