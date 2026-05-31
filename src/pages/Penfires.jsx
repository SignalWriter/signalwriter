import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Flame } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import EmptyState from "@/components/shared/EmptyState";
import TagBadge from "@/components/shared/TagBadge";

const statusColors = {
  emerging: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  confirmed: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  evolved: "bg-purple-400/10 text-purple-400 border-purple-400/20",
};

export default function Penfires() {
  const { data: penfires = [], isLoading } = useQuery({
    queryKey: ["penfires-page"],
    queryFn: () => base44.entities.Penfire.list("-updated_date", 50),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2 flex items-center gap-3">
          <Flame className="w-8 h-8 text-primary" />
          Penfires
        </h1>
        <p className="text-sm text-muted-foreground">
          Discoveries that survive recursion. Themes that reappear across extractions.
        </p>
      </motion.div>

      {penfires.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No Penfires yet"
          description="When a concept, phrase, or theme appears repeatedly across multiple extractions, MIRA will flag it as a Penfire. Keep extracting — patterns will emerge."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {penfires.map((penfire, i) => (
            <motion.div
              key={penfire.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/8 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-primary" />
                  <h3 className="text-base font-medium text-foreground">{penfire.name}</h3>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${statusColors[penfire.status] || statusColors.emerging}`}>
                  {penfire.status || "emerging"}
                </span>
              </div>

              <p className="text-sm text-foreground/70 leading-relaxed mb-4">
                {penfire.description}
              </p>

              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>{penfire.occurrence_count || 1} appearances</span>
                  {penfire.first_appearance && (
                    <span>First: {format(new Date(penfire.first_appearance), "MMM d, yyyy")}</span>
                  )}
                </div>
              </div>

              {penfire.related_insights?.length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Related Insights</p>
                  <div className="space-y-1">
                    {penfire.related_insights.map((insight, j) => (
                      <p key={j} className="text-xs text-foreground/60 italic">"{insight}"</p>
                    ))}
                  </div>
                </div>
              )}

              {penfire.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {penfire.tags.map(tag => (
                    <TagBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}