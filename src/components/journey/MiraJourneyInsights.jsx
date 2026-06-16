import { useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function MiraJourneyInsights({ extractions, penfires, completed }) {
  const insights = useMemo(() => {
    if (extractions.length < 3) return [];
    const list = [];

    // Source type completion rate
    const sourceCompletion = {};
    const sourceTotal = {};
    extractions.forEach(e => {
      const src = e.source_type || "other";
      sourceTotal[src] = (sourceTotal[src] || 0) + 1;
      if (["Completed", "Published"].includes(e.outcome?.status)) {
        sourceCompletion[src] = (sourceCompletion[src] || 0) + 1;
      }
    });
    const sourceRates = Object.entries(sourceCompletion)
      .map(([src, count]) => ({ src, rate: count / (sourceTotal[src] || 1), count }))
      .filter(x => x.count >= 2)
      .sort((a, b) => b.rate - a.rate);

    if (sourceRates.length >= 2) {
      const top = sourceRates[0];
      const bottom = sourceRates[sourceRates.length - 1];
      if (top.rate > bottom.rate * 1.5) {
        const label = top.src.replace("_", " ");
        list.push(`Your strongest completion pattern begins with ${label}s — ${Math.round(top.rate * 100)}% of those extractions reach a finished outcome.`);
      }
    } else if (sourceRates.length === 1) {
      list.push(`Your completed work consistently originates from ${sourceRates[0].src.replace("_", " ")}s. That signal is worth noting.`);
    }

    // Form-based completion
    const formCompletion = {};
    const formTotal = {};
    extractions.forEach(e => {
      const isDone = ["Completed", "Published"].includes(e.outcome?.status);
      (e.development_signals?.potential_forms || []).forEach(form => {
        formTotal[form] = (formTotal[form] || 0) + 1;
        if (isDone) formCompletion[form] = (formCompletion[form] || 0) + 1;
      });
    });
    const topForms = Object.entries(formCompletion)
      .map(([form, count]) => ({ form, rate: count / (formTotal[form] || 1), count }))
      .filter(x => x.count >= 2)
      .sort((a, b) => b.rate - a.rate);

    if (topForms.length >= 2) {
      const top = topForms[0];
      const bottom = topForms[topForms.length - 1];
      if (top.rate > bottom.rate * 1.5) {
        list.push(`You complete ${top.form}s ${Math.round(top.rate / (bottom.rate || 0.01))}x more often than ${bottom.form}s. Your output aligns naturally with ${top.form}s.`);
      }
    }

    // Penfires driving published work
    const pfPublished = penfires
      .map(pf => ({
        name: pf.name,
        count: (pf.related_extraction_ids || []).filter(id =>
          extractions.find(e => e.id === id && e.outcome?.status === "Published")
        ).length,
      }))
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count);

    if (pfPublished.length > 0) {
      list.push(`Most of your published work traces back to the "${pfPublished[0].name}" Penfire — that recurring theme is actively generating finished output.`);
    }

    // Archived → completed
    const archivedThenCompleted = completed.filter(e => {
      // We can't know historical status, but we can check if there are archived extractions that have completed outcomes
      return e.status === "archived" && ["Completed", "Published"].includes(e.outcome?.status);
    });
    if (archivedThenCompleted.length > 0) {
      list.push(`${archivedThenCompleted.length} of your completed outcomes came from discoveries you had archived. The archive is not a graveyard — it's a reserve.`);
    }

    // Completion velocity
    if (completed.length >= 3) {
      const sorted = [...completed].sort((a, b) =>
        new Date(a.outcome?.recorded_at || a.updated_date) - new Date(b.outcome?.recorded_at || b.updated_date)
      );
      const first = new Date(sorted[0].outcome?.recorded_at || sorted[0].updated_date);
      const last = new Date(sorted[sorted.length - 1].outcome?.recorded_at || sorted[sorted.length - 1].updated_date);
      const days = Math.max(1, Math.ceil((last - first) / (1000 * 60 * 60 * 24)));
      const rate = (completed.length / days * 30).toFixed(1);
      if (parseFloat(rate) > 0.5) {
        list.push(`You're completing roughly ${rate} discovery-to-outcome cycles per month. That's a meaningful creative throughput rate.`);
      }
    }

    return list.slice(0, 4);
  }, [extractions, penfires, completed]);

  if (insights.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-primary" />
        <h2 className="font-display text-lg text-foreground">MIRA — Journey Insights</h2>
      </div>
      <div className="space-y-3">
        {insights.map((insight, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/75 italic leading-relaxed">{insight}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}