import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Calendar, Hash, BookOpen, ExternalLink, ChevronDown, PenTool } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TagBadge from "@/components/shared/TagBadge";
import MomentumBadge from "./MomentumBadge";

export default function PenfireCard({ penfire, relatedExtractions, index }) {
  const [expanded, setExpanded] = useState(false);

  const count = penfire.occurrence_count || 1;
  const extractionCount = (penfire.related_extraction_ids || []).length;
  const mostRecent = relatedExtractions?.[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="rounded-xl border border-border/50 bg-card/70 hover:border-primary/30 transition-all duration-300"
    >
      {/* Header */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <Flame className="w-4 h-4 text-primary shrink-0" />
            <h3 className="font-display text-lg text-foreground leading-tight">{penfire.name}</h3>
          </div>
          <MomentumBadge penfire={penfire} />
        </div>

        <p className="text-sm text-foreground/70 leading-relaxed mb-4">{penfire.description}</p>

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground mb-4">
          <span className="flex items-center gap-1">
            <Hash className="w-3 h-3" />
            {count} {count === 1 ? "appearance" : "appearances"}
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {extractionCount} {extractionCount === 1 ? "extraction" : "extractions"}
          </span>
          {penfire.first_appearance && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              First: {format(new Date(penfire.first_appearance), "MMM d, yyyy")}
            </span>
          )}
          {penfire.latest_appearance && (
            <span className="flex items-center gap-1">
              Last: {format(new Date(penfire.latest_appearance), "MMM d, yyyy")}
            </span>
          )}
        </div>

        {mostRecent && (
          <p className="text-[11px] text-muted-foreground italic mb-4">
            Most recent: <span className="text-foreground/60">"{mostRecent.title}"</span>
          </p>
        )}

        {penfire.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {penfire.tags.map(tag => <TagBadge key={tag} tag={tag} />)}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-7"
            onClick={() => setExpanded(!expanded)}
          >
            <BookOpen className="w-3 h-3" />
            View Related Extractions
            <ChevronDown className={`w-3 h-3 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </Button>
          {mostRecent && (
            <Link to={`/extraction/${mostRecent.id}`}>
              <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7 text-muted-foreground hover:text-foreground">
                <ExternalLink className="w-3 h-3" />
                View Source
              </Button>
            </Link>
          )}
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7 text-primary/70 hover:text-primary">
            <PenTool className="w-3 h-3" />
            Develop
          </Button>
        </div>
      </div>

      {/* Expandable extraction list */}
      <AnimatePresence>
        {expanded && relatedExtractions?.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border/30"
          >
            <div className="px-5 py-4 space-y-2">
              <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-3">Linked Extractions</p>
              {relatedExtractions.map(ext => (
                <Link
                  key={ext.id}
                  to={`/extraction/${ext.id}`}
                  className="flex items-start gap-2 group"
                >
                  <div className="w-1 h-1 rounded-full bg-primary/40 mt-1.5 shrink-0 group-hover:bg-primary transition-colors" />
                  <div className="min-w-0">
                    <p className="text-sm text-foreground/80 group-hover:text-foreground transition-colors truncate">{ext.title}</p>
                    {ext.core_insight && (
                      <p className="text-xs text-muted-foreground truncate italic">"{ext.core_insight}"</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
        {expanded && (!relatedExtractions || relatedExtractions.length === 0) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border/30"
          >
            <p className="px-5 py-4 text-xs text-muted-foreground italic">No linked extractions yet.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}