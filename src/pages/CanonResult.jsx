import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, BookMarked, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { CanonEntryCard, CanonBlock, CanonListBlock, CanonSectionHeader } from "@/components/canon/CanonSection";
import MiraNote from "@/components/extraction/MiraNote";

export default function CanonResult() {
  const id = window.location.pathname.split("/").pop();

  const { data: update, isLoading } = useQuery({
    queryKey: ["canon-update", id],
    queryFn: async () => { const list = await base44.entities.CanonUpdate.filter({ id }); return list[0]; },
    enabled: !!id,
  });

  const { data: project } = useQuery({
    queryKey: ["project", update?.project_id],
    queryFn: async () => { const list = await base44.entities.Project.filter({ id: update.project_id }); return list[0]; },
    enabled: !!update?.project_id,
  });

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
  if (!update) return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-center">
      <p className="text-muted-foreground">Canon update not found.</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <Link to={update.project_id ? `/project/${update.project_id}` : "/projects"} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> {project?.title || "Back to Project"}
        </Link>
        {update.created_date && (
          <span className="text-xs text-muted-foreground/50">{format(new Date(update.created_date), "MMMM d, yyyy")}</span>
        )}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        <div className="flex items-center gap-3">
          <BookMarked className="w-6 h-6 text-primary" />
          <h1 className="font-display text-3xl text-foreground">Canon Update</h1>
        </div>

        {/* MIRA Note */}
        {update.mira_note && <MiraNote message={update.mira_note} />}

        {/* Canon Changes */}
        <CanonBlock label="Canon Changes" content={update.canon_changes} />

        {/* New Canon Entries */}
        {(update.new_canon_entries || []).length > 0 && (
          <div>
            <CanonSectionHeader label="New Canon Entries" count={update.new_canon_entries.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {update.new_canon_entries.map((entry, i) => (
                <CanonEntryCard key={i} entry={entry} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Canon Updates (deltas) */}
        {(update.canon_updates || []).length > 0 && (
          <div>
            <CanonSectionHeader label="Canon Updates" count={update.canon_updates.length} />
            <div className="space-y-2">
              {update.canon_updates.map((u, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/40 bg-card/50">
                  <p className="text-sm font-medium text-foreground mb-1">{u.name}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{u.delta}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relationships */}
        <CanonBlock label="Relationships" content={update.relationships} />

        {/* Contradictions & Tensions */}
        <CanonBlock label="Contradictions & Tensions" content={update.contradictions} />

        {/* Timeline */}
        <CanonBlock label="Timeline of Emergence" content={update.timeline_notes} />

        {/* References */}
        {(update.references || []).length > 0 && (
          <div>
            <CanonSectionHeader label="References" count={update.references.length} />
            <div className="space-y-2">
              {update.references.map((ref, i) => (
                <div key={i} className="p-3 rounded-xl border border-border/40 bg-card/50 flex items-start gap-3">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground flex-shrink-0 mt-0.5">{ref.type}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{ref.title}</p>
                    {ref.relevance && <p className="text-xs text-muted-foreground mt-0.5">{ref.relevance}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Influenced Projects */}
        {(update.influenced_projects || []).length > 0 && (
          <div>
            <CanonSectionHeader label="Influenced Projects" count={update.influenced_projects.length} />
            <div className="space-y-2">
              {update.influenced_projects.map((proj, i) => (
                <div key={i} className="p-3 rounded-xl border border-border/40 bg-card/50">
                  <p className="text-sm font-medium text-foreground">{proj.name}</p>
                  {proj.reason && <p className="text-xs text-muted-foreground mt-0.5">{proj.reason}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Updated Canon Summary */}
        {update.canon_summary && (
          <div>
            <CanonSectionHeader label="Updated Canon Summary" />
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/15">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-xs text-primary/70 uppercase tracking-[0.1em] font-medium">Current State of Knowledge</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{update.canon_summary}</p>
            </div>
          </div>
        )}

        {/* Suggested Queries */}
        <CanonListBlock label="Suggested Canon Queries" items={update.suggested_queries} />

        {/* Open Threads */}
        <CanonListBlock label="Open Threads" items={update.open_threads} />

        {/* Confidence Notes */}
        <CanonBlock label="Confidence Notes" content={update.confidence_notes} />

        {/* Source Preview */}
        {update.source_text && (
          <details className="group">
            <summary className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors list-none">
              <span className="inline-block transition-transform group-open:rotate-90">▶</span>
              View Source Conversation
            </summary>
            <div className="mt-3 p-4 rounded-xl bg-muted/20 border border-border/30 max-h-[360px] overflow-y-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">{update.source_text}</pre>
            </div>
          </details>
        )}
      </motion.div>
    </div>
  );
}