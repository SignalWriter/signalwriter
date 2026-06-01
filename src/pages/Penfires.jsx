import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Flame } from "lucide-react";
import { motion } from "framer-motion";
import EmptyState from "@/components/shared/EmptyState";
import PenfireSummaryBar from "@/components/penfires/PenfireSummaryBar";
import PenfireCard from "@/components/penfires/PenfireCard";
import { getMomentum } from "@/components/penfires/MomentumBadge";

const MOMENTUM_ORDER = { gaining: 0, returning: 1, new: 2, dormant: 3 };

export default function Penfires() {
  const { data: penfires = [], isLoading: loadingPenfires } = useQuery({
    queryKey: ["penfires-page"],
    queryFn: () => base44.entities.Penfire.list("-updated_date", 50),
  });

  const { data: extractions = [], isLoading: loadingExtractions } = useQuery({
    queryKey: ["all-extractions-overview"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 100),
  });

  const isLoading = loadingPenfires || loadingExtractions;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Build a lookup: penfire id → related extraction records
  const extractionById = Object.fromEntries(extractions.map(e => [e.id, e]));

  const enrichedPenfires = penfires.map(p => {
    const related = (p.related_extraction_ids || [])
      .map(id => extractionById[id])
      .filter(Boolean)
      .sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    return { penfire: p, relatedExtractions: related };
  });

  const sorted = [...enrichedPenfires].sort((a, b) => {
    const mA = MOMENTUM_ORDER[getMomentum(a.penfire)] ?? 99;
    const mB = MOMENTUM_ORDER[getMomentum(b.penfire)] ?? 99;
    if (mA !== mB) return mA - mB;
    return (b.penfire.occurrence_count || 1) - (a.penfire.occurrence_count || 1);
  });

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2 flex items-center gap-3">
          <Flame className="w-8 h-8 text-primary" />
          Penfires
        </h1>
        <p className="text-sm text-muted-foreground">
          These are the ideas that keep returning.
        </p>
      </motion.div>

      {penfires.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No Penfires yet"
          description="When a concept, phrase, or theme appears repeatedly across multiple extractions, MIRA will flag it as a Penfire. Keep extracting — patterns will emerge."
        />
      ) : (
        <>
          <PenfireSummaryBar penfires={penfires} />

          <div className="space-y-4">
            {sorted.map(({ penfire, relatedExtractions }, i) => (
              <PenfireCard
                key={penfire.id}
                penfire={penfire}
                relatedExtractions={relatedExtractions}
                index={i}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}