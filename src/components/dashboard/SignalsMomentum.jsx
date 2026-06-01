import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Flame, CircleDot, TrendingUp, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import TagBadge from "@/components/shared/TagBadge";

// --- Momentum label logic (mirrors MomentumBadge) ---
function getMomentum(penfire) {
  const count = penfire.occurrence_count || 1;
  const first = penfire.first_appearance ? new Date(penfire.first_appearance) : null;
  const latest = penfire.latest_appearance ? new Date(penfire.latest_appearance) : null;
  const daysSince = latest ? differenceInDays(new Date(), latest) : 999;

  if (count === 1) return { label: "New", color: "text-emerald-400", dot: "bg-emerald-400" };
  if (daysSince > 30) return { label: "Dormant", color: "text-muted-foreground", dot: "bg-muted-foreground" };
  if (count >= 4) return { label: "Enduring", color: "text-primary", dot: "bg-primary" };
  if (first && latest && differenceInDays(latest, first) > 0) return { label: "Gaining", color: "text-amber-400", dot: "bg-amber-400" };
  return { label: "Returning", color: "text-blue-400", dot: "bg-blue-400" };
}

// --- Seed count scorer ---
function scoreExtraction(e) {
  return (
    (e.thought_seeds?.length || 0) +
    (e.framework_seeds?.length || 0) +
    (e.story_seeds?.length || 0) +
    (e.project_implications?.length || 0) +
    (e.emerging_patterns?.length || 0)
  );
}

function SectionHeader({ icon: Icon, iconClass, children }) {
  return (
    <h3 className="font-display text-base text-foreground flex items-center gap-2 mb-3">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      {children}
    </h3>
  );
}

export default function SignalsMomentum({ extractions = [], penfires = [] }) {
  // 1. Top Active Penfires — sorted by occurrence then recency
  const topPenfires = useMemo(() =>
    [...penfires]
      .sort((a, b) => (b.occurrence_count || 1) - (a.occurrence_count || 1))
      .slice(0, 4),
    [penfires]
  );

  // 2. High-impact extractions — top 5 by seed score
  const highImpact = useMemo(() =>
    [...extractions]
      .sort((a, b) => scoreExtraction(b) - scoreExtraction(a))
      .slice(0, 5),
    [extractions]
  );

  // 3. Emerging patterns — deduplicated, cross-extraction
  const patternMap = useMemo(() => {
    const map = {};
    extractions.forEach(e => {
      (e.emerging_patterns || []).forEach(p => {
        const key = p.toLowerCase().trim();
        if (!map[key]) map[key] = { label: p, count: 0, extractionIds: [] };
        map[key].count++;
        map[key].extractionIds.push(e.id);
      });
    });
    return Object.values(map).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [extractions]);

  // 4. Open loops — deduplicated across extractions
  const openLoops = useMemo(() =>
    extractions.flatMap(e =>
      (e.open_loops || []).map(loop => ({ ...loop, extractionId: e.id, extractionTitle: e.title }))
    ).slice(0, 5),
    [extractions]
  );

  // 5. MIRA observation — derived from archive shape
  const miraObservation = useMemo(() => {
    if (extractions.length === 0) return null;
    const topPattern = patternMap[0]?.label;
    const topPenfire = topPenfires[0]?.name;
    if (topPattern && topPenfire) {
      return `"${topPattern}" continues to surface across recent discoveries. ${topPenfire} is emerging as a recurring signal — several previously isolated observations are beginning to converge.`;
    }
    if (topPenfire) {
      return `${topPenfire} keeps returning. The archive suggests this is not coincidence — it is continuity.`;
    }
    if (topPattern) {
      return `A recurring theme is forming around "${topPattern}." This pattern may be worth naming before it disperses.`;
    }
    return `${extractions.length} extractions archived. Keep extracting — patterns reveal themselves through accumulation, not intention.`;
  }, [extractions, patternMap, topPenfires]);

  if (extractions.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="space-y-8"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-border/30">
        <Flame className="w-5 h-5 text-primary" />
        <h2 className="font-display text-xl text-foreground">Signals Gaining Momentum</h2>
      </div>

      {/* MIRA Observation */}
      {miraObservation && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-medium mb-1">MIRA — Observation</p>
            <p className="text-sm text-foreground/70 italic leading-relaxed">{miraObservation}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Top Active Penfires */}
        {topPenfires.length > 0 && (
          <div>
            <SectionHeader icon={Flame} iconClass="text-primary">Top Active Penfires</SectionHeader>
            <div className="space-y-2">
              {topPenfires.map((pf, i) => {
                const m = getMomentum(pf);
                return (
                  <motion.div
                    key={pf.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-lg border border-primary/15 bg-primary/5 hover:bg-primary/8 transition-all"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${m.dot}`} />
                      <span className="text-sm text-foreground font-medium truncate">{pf.name}</span>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className="text-[10px] text-muted-foreground">{pf.occurrence_count || 1}×</span>
                      {pf.latest_appearance && (
                        <span className="text-[10px] text-muted-foreground/60 hidden sm:inline">
                          {format(new Date(pf.latest_appearance), "MMM d")}
                        </span>
                      )}
                      <span className={`text-[10px] font-medium ${m.color}`}>{m.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {penfires.length > 4 && (
              <Link to="/penfires" className="text-xs text-muted-foreground hover:text-primary transition-colors mt-2 inline-block">
                View all {penfires.length} penfires →
              </Link>
            )}
          </div>
        )}

        {/* 3. Emerging Patterns */}
        {patternMap.length > 0 && (
          <div>
            <SectionHeader icon={TrendingUp} iconClass="text-indigo-400">Emerging Patterns</SectionHeader>
            <div className="flex flex-wrap gap-2">
              {patternMap.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-indigo-400/20 bg-indigo-400/5"
                >
                  <span className="text-xs text-foreground/80">{p.label}</span>
                  {p.count > 1 && (
                    <span className="text-[10px] text-indigo-400 font-medium">{p.count}×</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. High-Impact Extractions */}
      {highImpact.length > 0 && (
        <div>
          <SectionHeader icon={Sparkles} iconClass="text-amber-400">Recent High-Impact Extractions</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {highImpact.map((e, i) => {
              const relatedPenfires = penfires.filter(pf =>
                (pf.related_extraction_ids || []).includes(e.id)
              );
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to={`/extraction/${e.id}`}
                    className="block p-4 rounded-xl border border-amber-400/15 bg-amber-400/5 hover:border-amber-400/30 hover:bg-amber-400/8 transition-all duration-200 group h-full"
                  >
                    <div className="flex items-start justify-between mb-1.5">
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1 flex-1">
                        {e.title}
                      </h4>
                      <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 ml-1" />
                    </div>
                    {e.source_thread_title && (
                      <p className="text-[10px] text-muted-foreground/50 italic mb-1 truncate">
                        {e.source_thread_title}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground/60 mb-2">
                      {format(new Date(e.created_date), "MMM d, yyyy")}
                      {e.source_platform && <span className="ml-2 opacity-60">· {e.source_platform}</span>}
                    </p>
                    {e.core_insight && (
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                        {e.core_insight}
                      </p>
                    )}
                    {relatedPenfires.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {relatedPenfires.slice(0, 2).map(pf => (
                          <span key={pf.id} className="inline-flex items-center gap-1 text-[10px] text-primary/70 bg-primary/8 px-2 py-0.5 rounded-full border border-primary/15">
                            <Flame className="w-2.5 h-2.5" />
                            {pf.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Open Loops */}
      {openLoops.length > 0 && (
        <div>
          <SectionHeader icon={CircleDot} iconClass="text-rose-400">Open Loops Requiring Attention</SectionHeader>
          <div className="space-y-2">
            {openLoops.map((loop, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Link
                  to={`/extraction/${loop.extractionId}`}
                  className="flex items-start gap-3 p-3 rounded-lg border border-rose-400/15 bg-rose-400/5 hover:border-rose-400/30 transition-all group"
                >
                  <CircleDot className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground/80">{loop.question}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">from: {loop.extractionTitle}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 ml-auto" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.section>
  );
}