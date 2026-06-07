import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, BookOpen, TrendingUp, Sparkles, ArrowRight, ExternalLink, Flame } from "lucide-react";
import { format, differenceInDays } from "date-fns";

const STATUS_META = {
  "Published":                  { color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/25", dot: "bg-emerald-400" },
  "Completed":                  { color: "text-sky-400",     bg: "bg-sky-400/10",     border: "border-sky-400/25",    dot: "bg-sky-400" },
  "In Progress":                { color: "text-amber-400",   bg: "bg-amber-400/10",   border: "border-amber-400/25",  dot: "bg-amber-400" },
  "Scheduled":                  { color: "text-violet-400",  bg: "bg-violet-400/10",  border: "border-violet-400/25", dot: "bg-violet-400" },
  "Merged Into Another Project":{ color: "text-indigo-400",  bg: "bg-indigo-400/10",  border: "border-indigo-400/25", dot: "bg-indigo-400" },
  "Still Exploring":            { color: "text-primary",     bg: "bg-primary/10",     border: "border-primary/25",    dot: "bg-primary" },
  "Abandoned":                  { color: "text-rose-400",    bg: "bg-rose-400/10",    border: "border-rose-400/25",   dot: "bg-rose-400" },
  "Archived":                   { color: "text-muted-foreground", bg: "bg-muted/30",  border: "border-border/40",     dot: "bg-muted-foreground" },
};

function StatCard({ label, value, sub, color = "text-foreground" }) {
  return (
    <div className="p-4 rounded-xl border border-border/30 bg-card/50 space-y-1">
      <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{label}</p>
      <p className={`text-3xl font-display ${color}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground/50">{sub}</p>}
    </div>
  );
}

function SectionHeader({ icon: Icon, iconClass, children }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon className={`w-4 h-4 ${iconClass}`} />
      <h2 className="font-display text-lg text-foreground">{children}</h2>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-border/25" />;
}

export default function Outcomes() {
  const { data: extractions = [], isLoading } = useQuery({
    queryKey: ["extractions-all"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 200),
  });

  const { data: penfires = [] } = useQuery({
    queryKey: ["penfires"],
    queryFn: () => base44.entities.Penfire.list(),
  });

  const withOutcome = useMemo(() => extractions.filter(e => e.outcome?.status), [extractions]);
  const published   = useMemo(() => withOutcome.filter(e => e.outcome.status === "Published"), [withOutcome]);
  const completed   = useMemo(() => withOutcome.filter(e => ["Completed", "Published"].includes(e.outcome.status)), [withOutcome]);
  const inProgress  = useMemo(() => withOutcome.filter(e => e.outcome.status === "In Progress"), [withOutcome]);
  const completionRate = extractions.length > 0 ? Math.round((completed.length / extractions.length) * 100) : 0;

  // Status breakdown
  const statusCounts = useMemo(() => {
    const counts = {};
    withOutcome.forEach(e => {
      const s = e.outcome.status;
      counts[s] = (counts[s] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [withOutcome]);

  // Most productive penfires — penfires with the most extractions that have completed/published outcomes
  const productivePenfires = useMemo(() => {
    return penfires.map(pf => {
      const related = (pf.related_extraction_ids || []);
      const completedFromThis = completed.filter(e => related.includes(e.id)).length;
      const publishedFromThis = published.filter(e => related.includes(e.id)).length;
      return { ...pf, completedCount: completedFromThis, publishedCount: publishedFromThis };
    }).filter(pf => pf.completedCount > 0).sort((a, b) => b.publishedCount - a.publishedCount).slice(0, 5);
  }, [penfires, completed, published]);

  // MIRA pattern analysis
  const miraInsights = useMemo(() => {
    if (withOutcome.length < 3) return [];
    const insights = [];

    // Which tags/themes lead to completions?
    const tagCompletion = {};
    const tagTotal = {};
    extractions.forEach(e => {
      const isCompleted = ["Completed", "Published"].includes(e.outcome?.status);
      (e.suggested_tags || []).forEach(tag => {
        tagTotal[tag] = (tagTotal[tag] || 0) + 1;
        if (isCompleted) tagCompletion[tag] = (tagCompletion[tag] || 0) + 1;
      });
    });

    const topCompletionTag = Object.entries(tagCompletion)
      .map(([tag, count]) => ({ tag, rate: count / (tagTotal[tag] || 1), count }))
      .filter(x => x.count >= 2)
      .sort((a, b) => b.rate - a.rate)[0];

    if (topCompletionTag && topCompletionTag.rate > 0.5) {
      insights.push(`Extractions tagged "${topCompletionTag.tag}" have a ${Math.round(topCompletionTag.rate * 100)}% completion rate — significantly above average.`);
    }

    // Which development forms lead to completions?
    const formCompletion = {};
    const formTotal = {};
    extractions.forEach(e => {
      const isCompleted = ["Completed", "Published"].includes(e.outcome?.status);
      (e.development_signals?.potential_forms || []).forEach(form => {
        formTotal[form] = (formTotal[form] || 0) + 1;
        if (isCompleted) formCompletion[form] = (formCompletion[form] || 0) + 1;
      });
    });

    const sortedForms = Object.entries(formCompletion)
      .map(([form, count]) => ({ form, rate: count / (formTotal[form] || 1), count }))
      .filter(x => x.count >= 2)
      .sort((a, b) => b.rate - a.rate);

    if (sortedForms.length >= 2) {
      const top = sortedForms[0];
      const bottom = sortedForms[sortedForms.length - 1];
      if (top.rate > bottom.rate * 1.5) {
        insights.push(`You complete ${top.form}s at ${Math.round(top.rate * 100)}% — compared to ${Math.round(bottom.rate * 100)}% for ${bottom.form}s. Your output aligns with ${top.form}s.`);
      }
    }

    // Penfires driving published work
    if (productivePenfires.length > 0 && published.length > 0) {
      const totalPublishedFromPenfires = productivePenfires.reduce((sum, pf) => sum + pf.publishedCount, 0);
      if (totalPublishedFromPenfires > 2) {
        insights.push(`${published.length} published assets trace back to ${productivePenfires.length} active Penfires. ${productivePenfires[0]?.name} is your most generative recurring signal.`);
      }
    }

    // Abandoned patterns
    const abandoned = withOutcome.filter(e => e.outcome.status === "Abandoned");
    if (abandoned.length > 2) {
      insights.push(`${abandoned.length} discoveries were marked Abandoned. These may still contain usable material — or signal that certain idea forms resist your current execution style.`);
    }

    return insights.slice(0, 3);
  }, [extractions, withOutcome, published, productivePenfires]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 space-y-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Outcomes</h1>
        <p className="text-sm text-muted-foreground">What became of your discoveries. The arc from signal to finished work.</p>
      </motion.div>

      {/* Stats grid */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard label="Total Extracted" value={extractions.length} />
          <StatCard label="With Outcome" value={withOutcome.length} />
          <StatCard label="Completed" value={completed.length} color="text-sky-400" />
          <StatCard label="Published" value={published.length} color="text-emerald-400" />
          <StatCard label="Completion Rate" value={`${completionRate}%`} color={completionRate > 30 ? "text-primary" : "text-muted-foreground"} sub="of all extractions" />
        </div>
      </motion.div>

      {/* MIRA Insights */}
      {miraInsights.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SectionHeader icon={Sparkles} iconClass="text-primary">MIRA — Pattern Analysis</SectionHeader>
          <div className="space-y-3">
            {miraInsights.map((insight, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15">
                <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground/75 italic leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <Divider />

      {/* Status breakdown */}
      {statusCounts.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionHeader icon={CheckCircle2} iconClass="text-emerald-400">Outcome Breakdown</SectionHeader>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {statusCounts.map(([status, count]) => {
              const st = STATUS_META[status] || STATUS_META["Still Exploring"];
              return (
                <div key={status} className={`p-3 rounded-xl border ${st.border} ${st.bg}`}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                    <span className={`text-[10px] font-medium ${st.color}`}>{status}</span>
                  </div>
                  <p className={`text-2xl font-display ${st.color}`}>{count}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <Divider />

      {/* Most productive penfires */}
      {productivePenfires.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionHeader icon={Flame} iconClass="text-primary">Most Productive Penfires</SectionHeader>
          <div className="space-y-2">
            {productivePenfires.map((pf, i) => (
              <div key={pf.id} className="flex items-center justify-between p-3.5 rounded-xl border border-primary/15 bg-primary/5">
                <div className="flex items-center gap-2 min-w-0">
                  <Flame className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{pf.name}</span>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-2 text-xs text-muted-foreground">
                  {pf.publishedCount > 0 && <span className="text-emerald-400">{pf.publishedCount} published</span>}
                  <span className="text-sky-400">{pf.completedCount} completed</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <Divider />

      {/* Recent outcomes timeline */}
      {withOutcome.length > 0 ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader icon={TrendingUp} iconClass="text-amber-400">Outcome Timeline</SectionHeader>
          <div className="space-y-2">
            {[...withOutcome]
              .sort((a, b) => new Date(b.outcome.recorded_at || b.created_date) - new Date(a.outcome.recorded_at || a.created_date))
              .slice(0, 20)
              .map((e, i) => {
                const st = STATUS_META[e.outcome.status] || STATUS_META["Still Exploring"];
                return (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <Link
                      to={`/extraction/${e.id}`}
                      className="flex items-start gap-3 p-3.5 rounded-xl border border-border/25 bg-card/30 hover:border-border/50 hover:bg-card/60 transition-all group"
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${st.dot} flex-shrink-0 mt-1.5`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {e.outcome.asset_title || e.title}
                            </p>
                            {e.outcome.asset_title && (
                              <p className="text-[10px] text-muted-foreground/50 truncate">↑ {e.title}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-[10px] font-medium ${st.color}`}>{e.outcome.status}</span>
                            {e.outcome.url && (
                              <a
                                href={e.outcome.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={ev => ev.stopPropagation()}
                                className="text-primary/50 hover:text-primary transition-colors"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                        {e.outcome.notes && (
                          <p className="text-xs text-muted-foreground/60 mt-1 line-clamp-1">{e.outcome.notes}</p>
                        )}
                        <p className="text-[10px] text-muted-foreground/40 mt-1">
                          {e.outcome.completion_date
                            ? format(new Date(e.outcome.completion_date), "MMM d, yyyy")
                            : e.outcome.recorded_at
                            ? format(new Date(e.outcome.recorded_at), "MMM d, yyyy")
                            : ""}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
          </div>
        </motion.div>
      ) : (
        <div className="text-center py-16 space-y-3">
          <CheckCircle2 className="w-8 h-8 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">No outcomes recorded yet.</p>
          <p className="text-xs text-muted-foreground/50">Open any extraction and record what happened next.</p>
        </div>
      )}
    </div>
  );
}