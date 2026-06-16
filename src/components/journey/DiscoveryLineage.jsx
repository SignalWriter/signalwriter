import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Flame, FileText, MessageSquare, ExternalLink, StickyNote } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

function LineageStep({ icon: Icon, label, title, subtitle, color = "text-muted-foreground", isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-7 h-7 rounded-lg border border-border/40 bg-card flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-3.5 h-3.5 ${color}`} />
        </div>
        {!isLast && <div className="w-px flex-1 bg-border/30 my-1" />}
      </div>
      <div className="pb-5 min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-0.5">{label}</p>
        <p className="text-sm font-medium text-foreground leading-snug">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed">{subtitle}</p>}
      </div>
    </div>
  );
}

const STATUS_COLOR = {
  "Published": "text-emerald-400",
  "Completed": "text-sky-400",
  "Launched": "text-violet-400",
};

export default function DiscoveryLineage({ extraction, allExtractions, penfires, onClose }) {
  const relatedPenfires = penfires.filter(pf =>
    (pf.related_extraction_ids || []).includes(extraction.id)
  );

  const relatedExtractions = allExtractions.filter(e =>
    e.id !== extraction.id &&
    (extraction.suggested_tags || []).some(tag => (e.suggested_tags || []).includes(tag))
  ).slice(0, 4);

  const outcomeColor = STATUS_COLOR[extraction.outcome?.status] || "text-primary";
  const steps = [
    {
      icon: MessageSquare,
      label: "Origin Conversation",
      title: extraction.source_thread_title || `${(extraction.source_type || "conversation").replace("_", " ")} via ${extraction.source_platform || "unknown source"}`,
      subtitle: extraction.source_original_date ? format(new Date(extraction.source_original_date), "MMMM d, yyyy") : null,
      color: "text-muted-foreground",
    },
    {
      icon: FileText,
      label: "Extraction",
      title: extraction.title,
      subtitle: extraction.core_insight ? extraction.core_insight.slice(0, 120) + (extraction.core_insight.length > 120 ? "…" : "") : null,
      color: "text-primary",
    },
    ...(extraction.development_signals?.most_likely_next_step ? [{
      icon: ArrowRight,
      label: "Development Signal",
      title: extraction.development_signals.most_likely_next_step,
      subtitle: (extraction.development_signals.potential_forms || []).join(" · ") || null,
      color: "text-violet-400",
    }] : []),
    ...(extraction.outcome?.status ? [{
      icon: ArrowRight,
      label: extraction.outcome.status,
      title: extraction.outcome.asset_title || extraction.title,
      subtitle: extraction.outcome.notes ? extraction.outcome.notes.slice(0, 100) + "…" : null,
      color: outcomeColor,
    }] : []),
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.97 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-border/50 bg-card shadow-2xl"
        >
          {/* Header */}
          <div className="sticky top-0 flex items-center justify-between p-5 pb-4 border-b border-border/30 bg-card z-10">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-0.5">Discovery Lineage</p>
              <h3 className="font-display text-xl text-foreground leading-tight">
                {extraction.outcome?.asset_title || extraction.title}
              </h3>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0 h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-5 space-y-6">
            {/* Journey path */}
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-4">How it became real</p>
              <div className="space-y-0">
                {steps.map((step, i) => (
                  <LineageStep
                    key={i}
                    icon={step.icon}
                    label={step.label}
                    title={step.title}
                    subtitle={step.subtitle}
                    color={step.color}
                    isLast={i === steps.length - 1}
                  />
                ))}
              </div>
            </div>

            {/* Notes */}
            {extraction.notes?.length > 0 && (
              <div className="border-t border-border/20 pt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <StickyNote className="w-3.5 h-3.5 text-muted-foreground/60" />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Associated Notes</p>
                </div>
                <div className="space-y-2">
                  {extraction.notes.slice(0, 3).map(note => (
                    <div key={note.id} className="px-3 py-2 rounded-lg bg-muted/20 border border-border/20">
                      <p className="text-xs text-foreground/70 leading-relaxed">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Penfires */}
            {relatedPenfires.length > 0 && (
              <div className="border-t border-border/20 pt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Flame className="w-3.5 h-3.5 text-primary/60" />
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50">Associated Penfires</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {relatedPenfires.map(pf => (
                    <span key={pf.id} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-primary/20 bg-primary/5 text-primary/80">
                      <Flame className="w-3 h-3" />
                      {pf.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related discoveries */}
            {relatedExtractions.length > 0 && (
              <div className="border-t border-border/20 pt-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground/50 mb-3">Associated Discoveries</p>
                <div className="space-y-1.5">
                  {relatedExtractions.map(e => (
                    <Link
                      key={e.id}
                      to={`/extraction/${e.id}`}
                      onClick={onClose}
                      className="flex items-center justify-between px-3 py-2 rounded-lg bg-card/40 hover:bg-card border border-border/20 hover:border-border/40 transition-all group"
                    >
                      <span className="text-xs text-foreground/70 group-hover:text-foreground transition-colors truncate">{e.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 ml-2" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
              <Link to={`/extraction/${extraction.id}`} onClick={onClose} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5" />
                  Open Full Extraction
                </Button>
              </Link>
              {extraction.outcome?.url && (
                <a href={extraction.outcome.url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-2 text-xs">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View Published
                  </Button>
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}