import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, BookMarked, BookOpen, AlertTriangle, Sparkles, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { CanonEntryCard, CanonBlock, CanonListBlock, CanonSectionHeader } from "@/components/canon/CanonSection";
import MiraNote from "@/components/extraction/MiraNote";
import { Button } from "@/components/ui/button";

function ContradictionReviewSection({ update, project }) {
  const [analysing, setAnalysing] = useState(false);
  const [miraFlags, setMiraFlags] = useState(null);
  const [showExisting, setShowExisting] = useState(false);

  // Parse stored contradictions text into bullet lines for display
  const storedLines = (update.contradictions || "")
    .split("\n")
    .map(l => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  const hasStoredContradictions = storedLines.length > 0;

  const runMiraAnalysis = async () => {
    if (!project) return;
    setAnalysing(true);
    const canonEntries = (project.canon_entries || [])
      .map(e => `${e.name} (${e.category}): ${e.description}`)
      .join("\n");
    const canonSummary = project.canon_summary || "";
    const newChanges = update.canon_changes || "";
    const newEntries = (update.new_canon_entries || [])
      .map(e => `${e.name}: ${e.description}`)
      .join("\n");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are MIRA, a canon continuity analyst. Compare the new canon update against the established project canon and identify specific contradictions or tensions.

ESTABLISHED CANON SUMMARY:
${canonSummary || "(none yet)"}

ESTABLISHED CANON ENTRIES:
${canonEntries || "(none yet)"}

NEW CANON CHANGES:
${newChanges}

NEW CANON ENTRIES:
${newEntries || "(none)"}

Identify contradictions where the new information conflicts with what was previously established. Be specific — name the exact canon entry or concept in conflict. If there are no contradictions, say so clearly.

Return JSON with:
- contradictions: array of objects with { canon_item: string, conflict: string, severity: "high"|"medium"|"low", suggestion: string }
- verdict: "clear" | "tensions_found"
- summary: string (one sentence overview)`,
      response_json_schema: {
        type: "object",
        properties: {
          contradictions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                canon_item: { type: "string" },
                conflict: { type: "string" },
                severity: { type: "string" },
                suggestion: { type: "string" }
              }
            }
          },
          verdict: { type: "string" },
          summary: { type: "string" }
        }
      }
    });

    setMiraFlags(res);
    setAnalysing(false);
  };

  const severityStyle = {
    high: "border-red-400/30 bg-red-400/5 text-red-400",
    medium: "border-amber-400/30 bg-amber-400/5 text-amber-400",
    low: "border-border/40 bg-muted/20 text-muted-foreground",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
        <span className="text-sm font-medium text-foreground uppercase tracking-[0.05em]">Contradiction Review</span>
        {hasStoredContradictions && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-400">{storedLines.length} flagged</span>
        )}
      </div>

      {/* Stored contradictions from the original MIRA analysis */}
      {hasStoredContradictions && (
        <div className="space-y-2">
          <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50">From this update's analysis</p>
          {storedLines.map((line, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-amber-400/20 bg-amber-400/5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground/80 leading-relaxed">{line}</p>
            </div>
          ))}
        </div>
      )}

      {!hasStoredContradictions && !miraFlags && (
        <div className="p-4 rounded-xl border border-border/30 bg-muted/10">
          <p className="text-xs text-muted-foreground/50 italic">No contradictions were flagged in the original analysis.</p>
        </div>
      )}

      {/* Deep analysis against established canon */}
      {project && (
        <div className="pt-2">
          {!miraFlags ? (
            <Button
              size="sm"
              variant="outline"
              onClick={runMiraAnalysis}
              disabled={analysing || !(project.canon_entries?.length > 0 || project.canon_summary)}
              className="gap-2 text-xs h-8 border-primary/20 hover:border-primary/40"
            >
              {analysing
                ? <><div className="w-3 h-3 border border-primary/30 border-t-primary rounded-full animate-spin" />Analysing canon…</>
                : <><Sparkles className="w-3.5 h-3.5 text-primary" />Deep-scan against established canon</>}
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground/50">MIRA deep scan — vs. established canon</p>
                <button onClick={() => setMiraFlags(null)} className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-colors">Clear</button>
              </div>

              {miraFlags.verdict === "clear" ? (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-400">No contradictions found</p>
                    {miraFlags.summary && <p className="text-xs text-foreground/60 mt-0.5">{miraFlags.summary}</p>}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {miraFlags.summary && (
                    <p className="text-xs text-foreground/60 italic px-1">{miraFlags.summary}</p>
                  )}
                  {(miraFlags.contradictions || []).map((c, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`p-4 rounded-xl border ${severityStyle[c.severity] || severityStyle.low}`}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-xs font-medium">{c.canon_item}</p>
                          <span className="text-[10px] opacity-60 capitalize">{c.severity} tension</span>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/75 leading-relaxed mb-2">{c.conflict}</p>
                      {c.suggestion && (
                        <p className="text-xs text-foreground/50 italic border-t border-current/10 pt-2 mt-2">
                          Suggestion: {c.suggestion}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!project.canon_entries?.length && !project.canon_summary && (
            <p className="text-[10px] text-muted-foreground/30 mt-2 italic">Deep scan requires established canon entries or a canon summary on the project.</p>
          )}
        </div>
      )}
    </div>
  );
}

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

        {/* Contradictions & Tensions — dedicated review section */}
        <ContradictionReviewSection update={update} project={project} />

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