import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { PenTool, Flame, CircleDot, TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";
import TagBadge from "@/components/shared/TagBadge";

function RecentExtractionCard({ extraction, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
    >
      <Link
        to={`/extraction/${extraction.id}`}
        className="block p-4 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-border/80 transition-all duration-200 group"
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {extraction.title}
          </h4>
          <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
        </div>
        {extraction.core_insight && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {extraction.core_insight}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-muted-foreground/60">
            {format(new Date(extraction.created_date), "MMM d")}
          </span>
          {extraction.suggested_tags?.slice(0, 3).map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      </Link>
    </motion.div>
  );
}

function PenfireCard({ penfire, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="p-4 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/8 transition-all duration-200"
    >
      <div className="flex items-center gap-2 mb-2">
        <Flame className="w-3.5 h-3.5 text-primary" />
        <h4 className="text-sm font-medium text-foreground">{penfire.name}</h4>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-2">
        {penfire.description}
      </p>
      <div className="flex items-center gap-3 text-[10px] text-muted-foreground/60">
        <span>{penfire.occurrence_count || 1} appearances</span>
        <span className="capitalize">{penfire.status}</span>
      </div>
    </motion.div>
  );
}

export default function Dashboard() {
  const { data: extractions = [], isLoading: loadingExtractions } = useQuery({
    queryKey: ["extractions"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 10),
  });

  const { data: penfires = [], isLoading: loadingPenfires } = useQuery({
    queryKey: ["penfires"],
    queryFn: () => base44.entities.Penfire.list("-updated_date", 10),
  });

  const openLoops = extractions.flatMap(e =>
    (e.open_loops || []).map(loop => ({ ...loop, extractionTitle: e.title, extractionId: e.id }))
  ).slice(0, 5);

  const patterns = extractions.flatMap(e =>
    (e.emerging_patterns || []).map(p => ({ pattern: p, extractionTitle: e.title }))
  ).slice(0, 5);

  const isEmpty = !loadingExtractions && extractions.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Your continuity workspace. Remember what mattered.</p>
      </motion.div>

      {isEmpty ? (
        <EmptyState
          icon={PenTool}
          title="Your signal archive is empty"
          description="Paste a conversation, transcript, journal entry, or thought dump — and let MIRA extract what matters."
          action={
            <Link to="/extract">
              <Button className="gap-2">
                <PenTool className="w-4 h-4" />
                Begin First Extraction
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* MIRA greeting */}
            {extractions.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-start gap-3 p-4 rounded-xl bg-primary/5 border border-primary/15"
              >
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-medium mb-1">MIRA</p>
                  <p className="text-sm text-foreground/70 italic">
                    {penfires.length > 0
                      ? `You have ${penfires.length} Penfire${penfires.length > 1 ? "s" : ""} emerging. ${extractions.length} extraction${extractions.length > 1 ? "s" : ""} archived.`
                      : `${extractions.length} extraction${extractions.length > 1 ? "s" : ""} archived. Keep extracting — patterns will emerge.`
                    }
                  </p>
                </div>
              </motion.div>
            )}

            {/* Recent Extractions */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg text-foreground">Recent Extractions</h2>
                <Link to="/workspace" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  View all →
                </Link>
              </div>
              <div className="space-y-3">
                {extractions.slice(0, 5).map((e, i) => (
                  <RecentExtractionCard key={e.id} extraction={e} index={i} />
                ))}
              </div>
            </section>

            {/* Open Loops */}
            {openLoops.length > 0 && (
              <section>
                <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <CircleDot className="w-4 h-4 text-rose-400" />
                  Open Loops
                </h2>
                <div className="space-y-2">
                  {openLoops.map((loop, i) => (
                    <Link
                      key={i}
                      to={`/extraction/${loop.extractionId}`}
                      className="block p-3 rounded-lg border border-rose-400/15 bg-rose-400/5 hover:border-rose-400/30 transition-all"
                    >
                      <p className="text-sm text-foreground/80">{loop.question}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">from: {loop.extractionTitle}</p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar column */}
          <div className="space-y-8">
            {/* Quick extract */}
            <Link to="/extract">
              <div className="p-5 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200 text-center group cursor-pointer">
                <PenTool className="w-5 h-5 text-primary mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <p className="text-sm font-medium text-foreground">New Extraction</p>
                <p className="text-[10px] text-muted-foreground mt-1">Paste. Extract. Preserve.</p>
              </div>
            </Link>

            {/* Penfires */}
            {penfires.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg text-foreground flex items-center gap-2">
                    <Flame className="w-4 h-4 text-primary" />
                    Penfires
                  </h2>
                  <Link to="/penfires" className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    View all →
                  </Link>
                </div>
                <div className="space-y-3">
                  {penfires.slice(0, 3).map((p, i) => (
                    <PenfireCard key={p.id} penfire={p} index={i} />
                  ))}
                </div>
              </section>
            )}

            {/* Emerging Patterns */}
            {patterns.length > 0 && (
              <section>
                <h2 className="font-display text-lg text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Patterns
                </h2>
                <div className="space-y-2">
                  {patterns.map((p, i) => (
                    <div key={i} className="p-3 rounded-lg border border-indigo-400/15 bg-indigo-400/5">
                      <p className="text-sm text-foreground/80">{p.pattern}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">from: {p.extractionTitle}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}