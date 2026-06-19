import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, GitMerge } from "lucide-react";

export default function MergeSignalModal({ signal, allSignals, open, onOpenChange }) {
  const [selectedId, setSelectedId] = useState(null);
  const [merging, setMerging] = useState(false);
  const queryClient = useQueryClient();

  const candidates = (allSignals || []).filter(s => s.id !== signal.id && s.status === "active");

  const handleMerge = async () => {
    if (!selectedId) return;
    setMerging(true);
    try {
      const target = candidates.find(s => s.id === selectedId);
      if (!target) return;

      const mergedExtractionIds = [...new Set([
        ...(signal.related_extraction_ids || []),
        ...(target.related_extraction_ids || []),
      ])];
      const mergedQuotes = [...new Set([
        ...(signal.key_quotes || []),
        ...(target.key_quotes || []),
      ])];
      const mergedTags = [...new Set([
        ...(signal.tags || []),
        ...(target.tags || []),
      ])];

      const firstSeen = signal.first_seen && target.first_seen
        ? (signal.first_seen < target.first_seen ? signal.first_seen : target.first_seen)
        : signal.first_seen || target.first_seen;
      const lastSeen = signal.last_seen && target.last_seen
        ? (signal.last_seen > target.last_seen ? signal.last_seen : target.last_seen)
        : signal.last_seen || target.last_seen;

      await base44.entities.Signal.update(signal.id, {
        related_extraction_ids: mergedExtractionIds,
        key_quotes: mergedQuotes,
        tags: mergedTags,
        first_seen: firstSeen,
        last_seen: lastSeen,
      });

      await base44.entities.Signal.update(target.id, {
        status: "merged",
        merged_into_id: signal.id,
      });

      queryClient.invalidateQueries({ queryKey: ["signals"] });
      queryClient.invalidateQueries({ queryKey: ["signal", signal.id] });
      queryClient.invalidateQueries({ queryKey: ["signals-preview"] });
      onOpenChange(false);
      setSelectedId(null);
    } finally {
      setMerging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Merge Signals</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Select a signal to merge into <span className="text-foreground font-medium">"{signal.name}"</span>.
          The selected signal will be absorbed and archived.
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {candidates.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedId === s.id
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/40 bg-card/50 hover:border-border"
              }`}
            >
              <p className="text-sm font-medium text-foreground">{s.name}</p>
              <p className="text-xs text-muted-foreground line-clamp-1">{s.summary}</p>
            </button>
          ))}
          {candidates.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No other active signals to merge with.</p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleMerge} disabled={!selectedId || merging} className="gap-2">
            {merging ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
            Merge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}