import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { PenTool, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import EmptyState from "@/components/shared/EmptyState";
import PrimerModal from "@/components/onboarding/PrimerModal";
import SignalsMomentum from "@/components/dashboard/SignalsMomentum";
import QuickCaptureModal from "@/components/dashboard/QuickCaptureModal";

export default function Dashboard() {
  const [showPrimer, setShowPrimer] = useState(false);
  const [showQuickCapture, setShowQuickCapture] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("sw_primer_dismissed");
    if (!dismissed) setShowPrimer(true);
  }, []);

  const handleDismissPrimer = () => {
    localStorage.setItem("sw_primer_dismissed", "1");
    setShowPrimer(false);
  };

  const { data: extractions = [], isLoading: loadingExtractions } = useQuery({
    queryKey: ["extractions"],
    queryFn: () => base44.entities.Extraction.filter({ status: "active" }, "-created_date", 30),
  });

  const { data: penfires = [] } = useQuery({
    queryKey: ["penfires"],
    queryFn: () => base44.entities.Penfire.list("-occurrence_count", 20),
  });

  const isEmpty = !loadingExtractions && extractions.length === 0;

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
      {showPrimer && <PrimerModal onDismiss={handleDismissPrimer} />}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex items-start justify-between"
      >
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your continuity workspace. Remember what mattered.</p>
        </div>
        <Link to="/extract">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-200 group cursor-pointer">
            <PenTool className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-foreground">New Extraction</span>
          </div>
        </Link>
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
        <SignalsMomentum extractions={extractions} penfires={penfires} />
      )}
      {/* Floating Quick Capture Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => setShowQuickCapture(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 hover:shadow-primary/20 hover:shadow-xl transition-all duration-200 group"
      >
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
        <span className="text-sm font-medium">Capture</span>
      </motion.button>

      <AnimatePresence>
        {showQuickCapture && (
          <QuickCaptureModal onClose={() => setShowQuickCapture(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}