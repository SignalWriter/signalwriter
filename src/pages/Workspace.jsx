import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Archive, ArrowRight, PenTool, ArchiveRestore, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { motion } from "framer-motion";
import EmptyState from "@/components/shared/EmptyState";
import TagBadge from "@/components/shared/TagBadge";
import CopyExtractionButton from "@/components/shared/CopyExtractionButton";
import ArchiveDeleteActions from "@/components/extraction/ArchiveDeleteActions";
import { cn } from "@/lib/utils";

const FILTERS = ["Active", "Archived", "All"];

export default function Workspace() {
  const [filter, setFilter] = useState("Active");

  const { data: extractions = [], isLoading } = useQuery({
    queryKey: ["extractions-workspace"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 100),
  });

  const visible = extractions.filter(e => {
    if (filter === "Active") return !e.status || e.status === "active";
    if (filter === "Archived") return e.status === "archived";
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const activeCount = extractions.filter(e => !e.status || e.status === "active").length;
  const archivedCount = extractions.filter(e => e.status === "archived").length;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Workspace</h1>
            <p className="text-sm text-muted-foreground">
              {activeCount} active · {archivedCount} archived
            </p>
          </div>
          <Link to="/extract">
            <Button variant="outline" size="sm" className="gap-2">
              <PenTool className="w-4 h-4" />
              New Extraction
            </Button>
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30 w-fit">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                filter === f
                  ? "bg-card text-foreground shadow-sm border border-border/30"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {visible.length === 0 ? (
        <EmptyState
          icon={filter === "Archived" ? Package : Archive}
          title={filter === "Archived" ? "No archived extractions" : "No extractions yet"}
          description={filter === "Archived"
            ? "Archived extractions will appear here. They're preserved but out of your active view."
            : "Your preserved discoveries will appear here."}
          action={filter !== "Archived" && (
            <Link to="/extract">
              <Button className="gap-2">
                <PenTool className="w-4 h-4" />
                Create First Extraction
              </Button>
            </Link>
          )}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <div className={cn(
                "block p-5 rounded-xl border bg-card/50 hover:bg-card transition-all duration-200 group",
                e.status === "archived"
                  ? "border-border/25 opacity-70 hover:opacity-100"
                  : "border-border/40 hover:border-border/80"
              )}>
                <div className="flex items-start justify-between mb-2">
                  <Link to={`/extraction/${e.id}`} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-medium text-foreground group-hover:text-primary transition-colors">
                        {e.title}
                      </h3>
                      {e.status === "archived" && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/30 flex-shrink-0">
                          Archived
                        </span>
                      )}
                    </div>
                    {e.source_thread_title && (
                      <p className="text-xs text-muted-foreground/60 mt-0.5 truncate">
                        Source Thread — <span className="italic">{e.source_thread_title}</span>
                      </p>
                    )}
                  </Link>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyExtractionButton extraction={e} size="sm" className="text-xs" />
                    <ArchiveDeleteActions extraction={e} />
                    <Link to={`/extraction/${e.id}`}>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
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
                    {e.source_platform && (
                      <span className="text-[10px] text-muted-foreground/50 bg-muted/40 px-1.5 py-0.5 rounded">
                        {e.source_platform}
                      </span>
                    )}
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