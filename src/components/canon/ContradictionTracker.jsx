import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CanonSectionHeader } from "@/components/canon/CanonSection";

const RESOLUTION_KEY = "canon_contradiction_resolutions";

function getResolutions(projectId) {
  try {
    const all = JSON.parse(localStorage.getItem(RESOLUTION_KEY) || "{}");
    return all[projectId] || {};
  } catch { return {}; }
}

function saveResolution(projectId, updateId, note) {
  try {
    const all = JSON.parse(localStorage.getItem(RESOLUTION_KEY) || "{}");
    if (!all[projectId]) all[projectId] = {};
    if (note === null) {
      delete all[projectId][updateId];
    } else {
      all[projectId][updateId] = { note, resolved_at: new Date().toISOString() };
    }
    localStorage.setItem(RESOLUTION_KEY, JSON.stringify(all));
  } catch {}
}

function ContradictionItem({ update, projectId, onResolve }) {
  const [expanded, setExpanded] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [note, setNote] = useState("");
  const resolutions = getResolutions(projectId);
  const isResolved = !!resolutions[update.id];
  const resolution = resolutions[update.id];

  const handleResolve = () => {
    saveResolution(projectId, update.id, note || "Marked as resolved.");
    setResolving(false);
    setNote("");
    onResolve();
  };

  const handleUnresolve = () => {
    saveResolution(projectId, update.id, null);
    onResolve();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border overflow-hidden transition-colors ${isResolved ? "border-border/20 bg-muted/10 opacity-60" : "border-amber-400/20 bg-amber-400/5"}`}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isResolved
            ? <CheckCircle2 className="w-4 h-4 text-emerald-400/70" />
            : <AlertTriangle className="w-4 h-4 text-amber-400" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground/85 leading-relaxed">{update.contradictions}</p>

          {isResolved && resolution && (
            <div className="mt-2 p-2 rounded-lg bg-emerald-400/5 border border-emerald-400/15">
              <p className="text-xs text-emerald-400/70 font-medium mb-0.5">Resolution note</p>
              <p className="text-xs text-foreground/60">{resolution.note}</p>
              <p className="text-[10px] text-muted-foreground/40 mt-1">{format(new Date(resolution.resolved_at), "MMM d, yyyy")}</p>
            </div>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Link to={`/canon-result/${update.id}`} className="text-[10px] text-muted-foreground/50 hover:text-primary transition-colors">
              Canon Update · {update.created_date && format(new Date(update.created_date), "MMM d, yyyy")} →
            </Link>
            {isResolved ? (
              <button onClick={handleUnresolve} className="text-[10px] text-muted-foreground/40 hover:text-destructive transition-colors">
                Mark unresolved
              </button>
            ) : (
              <button onClick={() => setResolving(r => !r)} className="text-[10px] text-primary/60 hover:text-primary transition-colors">
                {resolving ? "Cancel" : "Resolve →"}
              </button>
            )}
            {update.canon_changes && (
              <button onClick={() => setExpanded(v => !v)} className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors flex items-center gap-0.5">
                context {expanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resolve form */}
      <AnimatePresence>
        {resolving && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1 border-t border-amber-400/10 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground">How was this resolved?</p>
              <Textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="Describe how you resolved this tension (optional)..."
                className="bg-background/50 min-h-[60px] text-sm"
                autoFocus
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleResolve} className="h-7 text-xs gap-1.5">
                  <CheckCircle2 className="w-3 h-3" /> Mark Resolved
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setResolving(false)} className="h-7 text-xs text-muted-foreground">Cancel</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context expand */}
      <AnimatePresence>
        {expanded && update.canon_changes && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-3 pt-1 border-t border-border/20">
              <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1.5">What changed in this update</p>
              <p className="text-xs text-foreground/60 leading-relaxed">{update.canon_changes}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ContradictionTracker({ projectId, canonUpdates }) {
  const [showResolved, setShowResolved] = useState(false);
  const [tick, setTick] = useState(0); // force re-render on resolution change

  const refresh = () => setTick(t => t + 1);

  const updatesWithContradictions = canonUpdates.filter(u => !!u.contradictions?.trim());

  if (updatesWithContradictions.length === 0) return null;

  const resolutions = getResolutions(projectId);
  const unresolved = updatesWithContradictions.filter(u => !resolutions[u.id]);
  const resolved = updatesWithContradictions.filter(u => !!resolutions[u.id]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CanonSectionHeader label="Contradiction Tracker" count={unresolved.length > 0 ? unresolved.length : undefined} />
          {unresolved.length === 0 && resolved.length > 0 && (
            <span className="text-[10px] text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" />All clear</span>
          )}
        </div>
        {resolved.length > 0 && (
          <button onClick={() => setShowResolved(v => !v)} className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">
            {showResolved ? "Hide resolved" : `${resolved.length} resolved`}
          </button>
        )}
      </div>

      {unresolved.length === 0 && resolved.length > 0 && !showResolved ? (
        <div className="p-4 rounded-xl border border-emerald-400/15 bg-emerald-400/5 text-center">
          <p className="text-xs text-emerald-400/70">No active contradictions — all tensions have been resolved.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {unresolved.map(u => (
            <ContradictionItem key={u.id} update={u} projectId={projectId} onResolve={refresh} />
          ))}
          {showResolved && resolved.map(u => (
            <ContradictionItem key={u.id} update={u} projectId={projectId} onResolve={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}