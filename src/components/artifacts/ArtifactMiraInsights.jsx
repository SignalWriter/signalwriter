import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";

export default function ArtifactMiraInsights({ artifact, linkedExtractions = [], linkedPenfires = [] }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: (summary) => base44.entities.Artifact.update(artifact.id, { emergence_summary: summary }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["artifact", artifact.id] }),
  });

  const handleGenerate = async () => {
    setGenerating(true);
    const extractionContext = linkedExtractions.length > 0
      ? linkedExtractions.map(e => `- "${e.title}": ${e.core_insight || e.source_type}`).join("\n")
      : "No linked extractions.";
    const penfireContext = linkedPenfires.length > 0
      ? linkedPenfires.map(p => `- ${p.name}: ${p.description}`).join("\n")
      : "No linked penfires.";

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `You are MIRA, a continuity intelligence system for writers and creators.
An artifact has been archived with the following details:

Title: ${artifact.title}
Types: ${(artifact.artifact_types || []).join(", ") || "Unspecified"}
Description: ${artifact.description || "No description provided."}
Tags: ${(artifact.tags || []).join(", ") || "None"}
Notes: ${artifact.notes || "None"}

Linked Extractions:
${extractionContext}

Linked Penfires / Recurring Themes:
${penfireContext}

Generate an "Emergence Summary" — a brief, insightful, slightly poetic description of what this artifact likely meant when it first emerged. Focus on meaning, symbolism, and creative significance. 2-4 sentences. Write in third person, starting with "This artifact...".`,
    });

    await saveMutation.mutateAsync(result);
    setGenerating(false);
  };

  const insights = [];
  if (linkedExtractions.length > 0) insights.push(`Connected to ${linkedExtractions.length} extraction${linkedExtractions.length > 1 ? "s" : ""}.`);
  if (linkedPenfires.length > 0) insights.push(`Associated with ${linkedPenfires.length} penfire${linkedPenfires.length > 1 ? "s" : ""}.`);
  if ((artifact.related_artifact_ids || []).length > 0) insights.push(`Linked to ${artifact.related_artifact_ids.length} related artifact${artifact.related_artifact_ids.length > 1 ? "s" : ""}.`);
  if (artifact.created_date) {
    const daysSince = Math.floor((Date.now() - new Date(artifact.created_date)) / 86400000);
    if (daysSince > 30) insights.push(`Archived ${daysSince} days ago.`);
  }
  if ((artifact.associated_projects || []).length > 0) insights.push(`Influences ${artifact.associated_projects.length} project${artifact.associated_projects.length > 1 ? "s" : ""}.`);

  return (
    <div className="space-y-4">
      {/* Emergence Summary */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-lg text-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Emergence Summary
          </h3>
          <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={generating} className="gap-1.5 text-xs text-muted-foreground h-7">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
            {artifact.emergence_summary ? "Regenerate" : "Generate with MIRA"}
          </Button>
        </div>

        {artifact.emergence_summary ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-xl bg-primary/5 border border-primary/10">
            <p className="text-sm text-foreground/85 leading-relaxed italic">{artifact.emergence_summary}</p>
          </motion.div>
        ) : !generating && (
          <p className="text-xs text-muted-foreground/50 italic">MIRA can generate a summary of what this artifact meant when it emerged — based on its description, tags, and linked discoveries.</p>
        )}
        {generating && (
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
            <Loader2 className="w-4 h-4 text-primary animate-spin flex-shrink-0" />
            <p className="text-sm text-muted-foreground italic">MIRA is reading the artifact's emergence context...</p>
          </div>
        )}
      </div>

      {/* MIRA Observations */}
      {insights.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">MIRA Observations</p>
          <div className="space-y-1.5">
            {insights.map((obs, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="text-primary mt-0.5">◆</span>
                <span>{obs}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {artifact.created_date && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Timeline</p>
          <div className="relative pl-4 border-l border-border/30 space-y-2">
            <div className="relative">
              <div className="absolute -left-[1.35rem] top-1.5 w-1.5 h-1.5 rounded-full bg-primary/50" />
              <p className="text-xs text-muted-foreground">Archived — {format(new Date(artifact.created_date), "MMMM d, yyyy")}</p>
            </div>
            {linkedExtractions.map(e => e.created_date && (
              <div key={e.id} className="relative">
                <div className="absolute -left-[1.35rem] top-1.5 w-1.5 h-1.5 rounded-full bg-border" />
                <p className="text-xs text-muted-foreground">Linked to "{e.title}" — {format(new Date(e.created_date), "MMM d, yyyy")}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}