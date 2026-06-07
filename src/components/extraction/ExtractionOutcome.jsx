import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, ChevronDown, ExternalLink, Pencil, X } from "lucide-react";
import { format } from "date-fns";

const STATUSES = [
  { value: "Published",                 color: "text-emerald-400",  bg: "bg-emerald-400/10",  border: "border-emerald-400/25",  dot: "bg-emerald-400" },
  { value: "Completed",                 color: "text-sky-400",      bg: "bg-sky-400/10",      border: "border-sky-400/25",      dot: "bg-sky-400" },
  { value: "In Progress",               color: "text-amber-400",    bg: "bg-amber-400/10",    border: "border-amber-400/25",    dot: "bg-amber-400" },
  { value: "Scheduled",                 color: "text-violet-400",   bg: "bg-violet-400/10",   border: "border-violet-400/25",   dot: "bg-violet-400" },
  { value: "Merged Into Another Project",color: "text-indigo-400",  bg: "bg-indigo-400/10",   border: "border-indigo-400/25",   dot: "bg-indigo-400" },
  { value: "Still Exploring",           color: "text-primary",      bg: "bg-primary/10",      border: "border-primary/25",      dot: "bg-primary" },
  { value: "Abandoned",                 color: "text-rose-400",     bg: "bg-rose-400/10",     border: "border-rose-400/25",     dot: "bg-rose-400" },
  { value: "Archived",                  color: "text-muted-foreground", bg: "bg-muted/30", border: "border-border/40",        dot: "bg-muted-foreground" },
];

function getStatus(value) {
  return STATUSES.find(s => s.value === value) || STATUSES[5];
}

function OutcomeForm({ extraction, initial, onSave, onCancel }) {
  const [status, setStatus] = useState(initial?.status || "Still Exploring");
  const [assetTitle, setAssetTitle] = useState(initial?.asset_title || "");
  const [completionDate, setCompletionDate] = useState(initial?.completion_date || "");
  const [url, setUrl] = useState(initial?.url || "");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [lessons, setLessons] = useState(initial?.lessons_learned || "");
  const [showStatus, setShowStatus] = useState(false);

  const selected = getStatus(status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="space-y-4 p-4 rounded-xl border border-border/30 bg-muted/10"
    >
      {/* Status selector */}
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Status</label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStatus(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${selected.border} ${selected.bg} text-left w-full`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${selected.dot} flex-shrink-0`} />
            <span className={`text-sm font-medium ${selected.color} flex-1`}>{status}</span>
            <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${showStatus ? "rotate-180" : ""}`} />
          </button>
          <AnimatePresence>
            {showStatus && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 top-full mt-1 z-20 w-full bg-card border border-border rounded-xl shadow-xl overflow-hidden"
              >
                {STATUSES.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => { setStatus(s.value); setShowStatus(false); }}
                    className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-left hover:bg-muted/30 transition-colors ${status === s.value ? "bg-muted/20" : ""}`}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
                    <span className={`text-sm ${s.color}`}>{s.value}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Optional fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Asset Title</label>
          <input
            type="text"
            value={assetTitle}
            onChange={e => setAssetTitle(e.target.value)}
            placeholder='e.g. "The Shift" (Medium Article)'
            className="w-full px-3 py-2 rounded-lg text-sm bg-card/50 border border-border/40 focus:border-primary/40 focus:outline-none text-foreground placeholder:text-muted-foreground/40"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Completion Date</label>
          <input
            type="date"
            value={completionDate}
            onChange={e => setCompletionDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg text-sm bg-card/50 border border-border/40 focus:border-primary/40 focus:outline-none text-foreground"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">URL (if published)</label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://..."
          className="w-full px-3 py-2 rounded-lg text-sm bg-card/50 border border-border/40 focus:border-primary/40 focus:outline-none text-foreground placeholder:text-muted-foreground/40"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">What happened</label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="The story of what this became..."
          className="text-sm bg-card/50 border-border/40 focus:border-primary/40 resize-none min-h-[64px]"
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Lessons Learned</label>
        <Textarea
          value={lessons}
          onChange={e => setLessons(e.target.value)}
          placeholder="What completing or abandoning this taught you..."
          className="text-sm bg-card/50 border-border/40 focus:border-primary/40 resize-none min-h-[64px]"
        />
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel} className="h-7 text-xs text-muted-foreground">
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave({ status, asset_title: assetTitle, completion_date: completionDate, url, notes, lessons_learned: lessons, recorded_at: new Date().toISOString() })} className="h-7 text-xs px-4">
          Save Outcome
        </Button>
      </div>
    </motion.div>
  );
}

export default function ExtractionOutcome({ extraction }) {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const outcome = extraction.outcome;

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      await base44.entities.Extraction.update(extraction.id, { outcome: data });
      queryClient.invalidateQueries({ queryKey: ["extraction", extraction.id] });
      queryClient.invalidateQueries({ queryKey: ["extractions"] });
      queryClient.invalidateQueries({ queryKey: ["extractions-all"] });
    },
    onSuccess: () => setEditing(false),
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      await base44.entities.Extraction.update(extraction.id, { outcome: null });
      queryClient.invalidateQueries({ queryKey: ["extraction", extraction.id] });
      queryClient.invalidateQueries({ queryKey: ["extractions"] });
      queryClient.invalidateQueries({ queryKey: ["extractions-all"] });
    },
  });

  const st = outcome?.status ? getStatus(outcome.status) : null;

  return (
    <div className="space-y-3">
      {/* Section label */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">Outcome</span>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors"
          >
            <Pencil className="w-3 h-3" />
            {outcome ? "Edit" : "Record Outcome"}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {editing ? (
          <OutcomeForm
            key="form"
            extraction={extraction}
            initial={outcome}
            onSave={data => saveMutation.mutate(data)}
            onCancel={() => setEditing(false)}
          />
        ) : outcome ? (
          <motion.div
            key="display"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border ${st.border} ${st.bg} space-y-3`}
          >
            {/* Status badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${st.color}`} />
                <span className={`text-sm font-medium ${st.color}`}>{outcome.status}</span>
              </div>
              <button
                onClick={() => clearMutation.mutate()}
                className="text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {outcome.asset_title && (
              <p className="text-sm font-display italic text-foreground/90">"{outcome.asset_title}"</p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-[10px] text-muted-foreground/60">
              {outcome.completion_date && (
                <span>{format(new Date(outcome.completion_date), "MMM d, yyyy")}</span>
              )}
              {outcome.url && (
                <a
                  href={outcome.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  View published
                </a>
              )}
            </div>

            {outcome.notes && (
              <p className="text-sm text-foreground/70 leading-relaxed border-t border-border/20 pt-3">{outcome.notes}</p>
            )}

            {outcome.lessons_learned && (
              <div className="border-t border-border/20 pt-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-1">Lessons Learned</p>
                <p className="text-sm text-foreground/60 leading-relaxed italic">{outcome.lessons_learned}</p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-muted-foreground/40 italic py-1"
          >
            <Circle className="w-3.5 h-3.5" />
            No outcome recorded yet
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}