import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Archive, ArrowRight, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import EmptyState from "@/components/shared/EmptyState";
import TagBadge from "@/components/shared/TagBadge";
import CopyExtractionButton from "@/components/shared/CopyExtractionButton";

export default function Workspace() {
  const { data: extractions = [], isLoading } = useQuery({
    queryKey: ["extractions-workspace"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 50),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Workspace</h1>
        <p className="text-sm text-muted-foreground">
          {extractions.length} extraction{extractions.length !== 1 ? "s" : ""} archived
        </p>
      </motion.div>

      {extractions.length === 0 ? (
        <EmptyState
          icon={Archive}
          title="No extractions yet"
          description="Your preserved discoveries will appear here."
          action={
            <Link to="/extract">
              <Button className="gap-2">
                <PenTool className="w-4 h-4" />
                Create First Extraction
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {extractions.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className="block p-5 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-border/80 transition-all duration-200 group">
                <div className="flex items-start justify-between mb-2">
                  <Link to={`/extraction/${e.id}`} className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                      {e.title}
                    </h3>
                  </Link>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <CopyExtractionButton extraction={e} size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-xs" />
                    <Link to={`/extraction/${e.id}`}>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </div>
                </div>
                <Link to={`/extraction/${e.id}`}>
                  {e.core_insight && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {e.core_insight}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground/60">
                      {format(new Date(e.created_date), "MMM d, yyyy")}
                    </span>
                    <span className="text-[10px] text-muted-foreground/40 capitalize">
                      {(e.source_type || "").replace("_", " ")}
                    </span>
                    {e.suggested_tags?.slice(0, 4).map(tag => (
                      <TagBadge key={tag} tag={tag} />
                    ))}
                  </div>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}