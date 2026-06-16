import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { Map, Sparkles, CheckCircle2, TrendingUp, Zap, BookOpen, ExternalLink, ArrowRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { Link } from "react-router-dom";
import JourneyMetrics from "@/components/journey/JourneyMetrics";
import RecentWins from "@/components/journey/RecentWins";
import EmergingOpportunities from "@/components/journey/EmergingOpportunities";
import MiraJourneyInsights from "@/components/journey/MiraJourneyInsights";
import DiscoveryLineage from "@/components/journey/DiscoveryLineage";

export default function MissionJourney() {
  const [selectedOutcome, setSelectedOutcome] = useState(null);

  const { data: extractions = [], isLoading } = useQuery({
    queryKey: ["extractions-journey"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 200),
  });

  const { data: penfires = [] } = useQuery({
    queryKey: ["penfires"],
    queryFn: () => base44.entities.Penfire.list(),
  });

  const { data: mission } = useQuery({
    queryKey: ["mission-alignment"],
    queryFn: async () => {
      const list = await base44.entities.MissionAlignment.list("-created_date", 1);
      return list[0] || null;
    },
  });

  const completed = useMemo(() =>
    extractions.filter(e => ["Completed", "Published", "Launched"].includes(e.outcome?.status)),
    [extractions]
  );

  const inProgress = useMemo(() =>
    extractions.filter(e => ["In Progress", "Scheduled"].includes(e.outcome?.status)),
    [extractions]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 space-y-10">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-start gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Map className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">Mission Journey</h1>
            <p className="text-sm text-muted-foreground mt-1">
              From first discovery to finished work — tracing how your ideas became real.
            </p>
          </div>
        </div>
      </motion.div>

      <JourneyMetrics extractions={extractions} />

      <RecentWins completed={completed} onSelect={setSelectedOutcome} />

      <EmergingOpportunities extractions={extractions} mission={mission} inProgress={inProgress} />

      <MiraJourneyInsights extractions={extractions} penfires={penfires} completed={completed} />

      {selectedOutcome && (
        <DiscoveryLineage
          extraction={selectedOutcome}
          allExtractions={extractions}
          penfires={penfires}
          onClose={() => setSelectedOutcome(null)}
        />
      )}
    </div>
  );
}