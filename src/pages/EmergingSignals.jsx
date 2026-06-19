import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Radar, Loader2, Sparkles, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import SignalCard from "@/components/signals/SignalCard";
import EmptyState from "@/components/shared/EmptyState";

export default function EmergingSignals() {
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [mergeSuggestions, setMergeSuggestions] = useState([]);
  const queryClient = useQueryClient();

  const { data: signals = [], isLoading } = useQuery({
    queryKey: ["signals"],
    queryFn: () => base44.entities.Signal.filter({ status: "active" }, "-last_seen", 100),
  });

  const { data: extractions = [] } = useQuery({
    queryKey: ["all-extractions-for-scan"],
    queryFn: () => base44.entities.Extraction.filter({ status: "active" }, "-created_date", 200),
  });

  const handleScan = async () => {
    if (extractions.length < 2) return;
    setScanning(true);
    setScanError(null);
    try {
      const condensed = extractions.map(e => ({
        id: e.id,
        title: e.title,
        core_insight: (e.core_insight || "").slice(0, 200),
        tags: (e.suggested_tags || []).join(", "),
        patterns: (e.emerging_patterns || []).join(", "),
        quotes: (e.quotable_lines || []).slice(0, 3).join(" | "),
        date: e.created_date?.split("T")[0] || "",
      }));

      const existingSignals = signals.map(s => ({
        id: s.id, name: s.name, summary: s.summary,
        extraction_ids: s.related_extraction_ids || [],
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are MIRA, an archival intelligence analyzing a writer's extraction library for recurring patterns.

Identify SIGNALS — recurring concepts, themes, frustrations, questions, frameworks, or insights that appear across multiple extractions. A signal represents an idea the user has been circling, often without realizing it. Only surface genuine patterns that appear in at least 2 extractions.

EXISTING SIGNALS (update if new extractions are relevant — use their exact id in existing_signal_id):
${existingSignals.length > 0 ? JSON.stringify(existingSignals) : "None yet."}

EXTRACTIONS TO ANALYZE:
${JSON.stringify(condensed)}

For each signal:
- name: Concise, evocative name (e.g., "Continuity Debt", "The Glue Problem")
- summary: One clear sentence describing what this signal represents — like a dictionary entry for an idea the user invented
- trend: "growing" (appearing more recently/frequently), "stable" (consistent over time), "fading" (hasn't appeared recently)
- related_extraction_ids: Array of extraction IDs that contribute to this signal (minimum 2)
- key_quotes: 2-5 notable phrases from those extractions that embody this signal
- tags: Relevant topic tags
- existing_signal_id: If updating an existing signal, include its ID. Otherwise null.

Also identify merge_suggestions — groups of signals (by name) that may describe the same underlying idea.

Quality over quantity. Every signal must be grounded in actual extraction content.`,
        response_json_schema: {
          type: "object",
          properties: {
            signals: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  summary: { type: "string" },
                  trend: { type: "string" },
                  related_extraction_ids: { type: "array", items: { type: "string" } },
                  key_quotes: { type: "array", items: { type: "string" } },
                  tags: { type: "array", items: { type: "string" } },
                  existing_signal_id: { type: "string" },
                },
              },
            },
            merge_suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  signal_names: { type: "array", items: { type: "string" } },
                  reason: { type: "string" },
                  suggested_name: { type: "string" },
                },
              },
            },
          },
        },
        model: "claude_sonnet_4_6",
      });

      for (const sig of result.signals || []) {
        const relatedDates = (sig.related_extraction_ids || [])
          .map(id => extractions.find(e => e.id === id)?.created_date)
          .filter(Boolean)
          .sort();

        const data = {
          name: sig.name,
          summary: sig.summary,
          trend: sig.trend || "stable",
          status: "active",
          related_extraction_ids: sig.related_extraction_ids || [],
          key_quotes: sig.key_quotes || [],
          first_seen: relatedDates[0]?.split("T")[0] || new Date().toISOString().split("T")[0],
          last_seen: relatedDates[relatedDates.length - 1]?.split("T")[0] || new Date().toISOString().split("T")[0],
          tags: sig.tags || [],
        };

        if (sig.existing_signal_id && signals.some(s => s.id === sig.existing_signal_id)) {
          await base44.entities.Signal.update(sig.existing_signal_id, data);
        } else {
          await base44.entities.Signal.create(data);
        }
      }

      setMergeSuggestions(result.merge_suggestions || []);
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      queryClient.invalidateQueries({ queryKey: ["signals-preview"] });
    } catch (err) {
      setScanError("Signal detection encountered an issue. Please try again.");
    } finally {
      setScanning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Emerging Signals</h1>
          <p className="text-sm text-muted-foreground">Patterns MIRA has detected across your archive</p>
        </div>
        <Button onClick={handleScan} disabled={scanning || extractions.length < 2} className="gap-2 flex-shrink-0">
          {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {scanning ? "Analyzing..." : "Scan Archive"}
        </Button>
      </motion.div>

      {scanning && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 p-6 rounded-xl border border-primary/20 bg-primary/5 text-center">
          <Sparkles className="w-5 h-5 text-primary mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-foreground font-medium mb-1">MIRA is analyzing your archive</p>
          <p className="text-xs text-muted-foreground">Looking for ideas you've been circling without realizing...</p>
        </motion.div>
      )}

      {scanError && (
        <div className="mb-6 p-4 rounded-xl border border-destructive/30 bg-destructive/5 flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
          <p className="text-sm text-destructive">{scanError}</p>
        </div>
      )}

      <AnimatePresence>
        {mergeSuggestions.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-8 space-y-3">
            {mergeSuggestions.map((ms, i) => (
              <div key={i} className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                <p className="text-sm text-foreground mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-primary inline mr-1.5 align-text-bottom" />
                  These signals appear related: <strong>{ms.signal_names?.join(", ")}</strong>
                </p>
                <p className="text-xs text-muted-foreground">{ms.reason}</p>
                {ms.suggested_name && (
                  <p className="text-xs text-primary/70 mt-1">Suggested merge name: "{ms.suggested_name}"</p>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {signals.length > 0 ? (
        <div className="grid gap-3">
          {signals.map((signal, i) => (
            <SignalCard key={signal.id} signal={signal} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Radar}
          title="No signals detected yet"
          description={<>Your archive holds the patterns.<br />Scan to reveal what MIRA has been noticing across your extractions.</>}
          action={
            extractions.length >= 2 ? (
              <Button onClick={handleScan} disabled={scanning} className="gap-2">
                <Radar className="w-4 h-4" />
                Scan for Signals
              </Button>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">Add at least 2 extractions to begin signal detection.</p>
            )
          }
        />
      )}
    </div>
  );
}