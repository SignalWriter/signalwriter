import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { format } from "date-fns";

function scoreRelevance(candidate, current) {
  let score = 0;
  const currentTags = new Set((current.suggested_tags || []).map(t => t.toLowerCase()));
  const currentPatterns = new Set((current.emerging_patterns || []).map(p => p.toLowerCase()));

  // Shared tags
  (candidate.suggested_tags || []).forEach(tag => {
    if (currentTags.has(tag.toLowerCase())) score += 3;
  });

  // Shared emerging patterns
  (candidate.emerging_patterns || []).forEach(p => {
    if (currentPatterns.has(p.toLowerCase())) score += 2;
  });

  // Shared penfire links
  const currentPenfires = new Set(current.penfire_ids || []);
  (candidate.penfire_ids || []).forEach(id => {
    if (currentPenfires.has(id)) score += 4;
  });

  // Shared source type
  if (candidate.source_type && candidate.source_type === current.source_type) score += 1;

  return score;
}

export default function RelatedDiscoveries({ extraction, allExtractions }) {
  const related = useMemo(() => {
    if (!allExtractions?.length) return [];
    return allExtractions
      .filter(e => e.id !== extraction.id)
      .map(e => ({ ...e, _score: scoreRelevance(e, extraction) }))
      .filter(e => e._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 4);
  }, [allExtractions, extraction]);

  if (!related.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mt-10 pt-8 border-t border-border/30"
    >
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-3.5 h-3.5 text-primary/60" />
        <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
          Related Discoveries
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {related.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
          >
            <Link
              to={`/extraction/${e.id}`}
              className="block p-4 rounded-xl border border-border/30 bg-card/50 hover:bg-card hover:border-border/60 transition-all group"
            >
              <p className="text-sm font-medium text-foreground/90 group-hover:text-foreground leading-snug mb-2 line-clamp-2 font-display">
                {e.title}
              </p>
              {e.core_insight && (
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
                  {e.core_insight}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {e.suggested_tags?.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[9px] uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-muted/50 text-muted-foreground/70">
                    {tag}
                  </span>
                ))}
                <span className="ml-auto text-[10px] text-muted-foreground/40">
                  {format(new Date(e.created_date), "MMM d")}
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}