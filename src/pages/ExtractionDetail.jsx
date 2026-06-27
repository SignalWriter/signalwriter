import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import ArtifactCard from "@/components/extraction/ArtifactCard";
import MiraNote from "@/components/extraction/MiraNote";
import ReturnToOrigin from "@/components/extraction/ReturnToOrigin";
import TagBadge from "@/components/shared/TagBadge";
import CopyExtractionButton from "@/components/shared/CopyExtractionButton";
import LinkToPenfireButton from "@/components/extraction/LinkToPenfireButton";
import DevelopmentSignals from "@/components/extraction/DevelopmentSignals";
import ExtractionNotes from "@/components/extraction/ExtractionNotes";
import ExtractionArtifacts from "@/components/extraction/ExtractionArtifacts";
import ExtractionReferences from "@/components/extraction/ExtractionReferences";
import ExtractionInfluencedProjects from "@/components/extraction/ExtractionInfluencedProjects";
import RelatedDiscoveries from "@/components/extraction/RelatedDiscoveries";
import ExtractionOutcome from "@/components/extraction/ExtractionOutcome";
import ArchiveDeleteActions from "@/components/extraction/ArchiveDeleteActions";

export default function ExtractionDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const id = window.location.pathname.split("/").pop();

  const { data: extraction, isLoading } = useQuery({
    queryKey: ["extraction", id],
    queryFn: async () => {
      const list = await base44.entities.Extraction.filter({ id });
      return list[0];
    },
    enabled: !!id,
  });

  const { data: allExtractions } = useQuery({
    queryKey: ["extractions-all"],
    queryFn: () => base44.entities.Extraction.list(),
    enabled: !!extraction,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!extraction) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-muted-foreground">Extraction not found.</p>
        <Link to="/workspace" className="text-primary text-sm mt-2 inline-block">← Back to Workspace</Link>
      </div>
    );
  }

  const allArtifacts = [
    ...(extraction.thought_seeds || []).map(s => ({ type: "thought_seed", content: s.content, subtitle: s.context })),
    ...(extraction.framework_seeds || []).map(s => ({ type: "framework_seed", title: s.name, content: s.description })),
    ...(extraction.story_seeds || []).map(s => ({ type: "story_seed", content: s.premise, subtitle: s.elements })),
    ...(extraction.project_implications || []).map(s => ({ type: "project_implication", content: s.idea, subtitle: s.domain })),
    ...(extraction.quotable_lines || []).map(q => ({ type: "quotable", content: `"${q}"` })),
    ...(extraction.emerging_patterns || []).map(p => ({ type: "pattern", content: p })),
    ...(extraction.open_loops || []).map(l => ({ type: "open_loop", content: l.question, subtitle: l.context })),
  ];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <Link
          to="/workspace"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspace
        </Link>
        <div className="flex items-center gap-2">
          <LinkToPenfireButton extraction={extraction} />
          <CopyExtractionButton extraction={extraction} />
          <ArchiveDeleteActions
            extraction={extraction}
            onArchived={() => window.history.back()}
            onDeleted={() => window.history.back()}
            onRestored={() => {}}
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(extraction.created_date), "MMMM d, yyyy")}
          </span>
          <span className="flex items-center gap-1 capitalize">
            <FileText className="w-3 h-3" />
            {(extraction.source_type || "other").replace("_", " ")}
          </span>
        </div>

        <h1 className="font-display text-3xl text-foreground mb-5">{extraction.title}</h1>

        <div className="mb-6">
          <ReturnToOrigin extraction={extraction} />
        </div>

        {extraction.source_text && (
          <details className="group mb-6">
            <summary className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors list-none">
              <span className="inline-block transition-transform group-open:rotate-90">▶</span>
              View Original Source Material
            </summary>
            <div className="mt-3 p-4 rounded-xl bg-muted/20 border border-border/30 max-h-[360px] overflow-y-auto">
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
                {extraction.source_text}
              </pre>
            </div>
          </details>
        )}

        {extraction.core_insight && (
          <ArtifactCard type="insight" content={extraction.core_insight} index={0} />
        )}
      </motion.div>

      <div className="mt-6">
        <MiraNote message={extraction.mira_note} />
      </div>

      {allArtifacts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8">
          {allArtifacts.map((artifact, i) => (
            <ArtifactCard
              key={i}
              type={artifact.type}
              title={artifact.title}
              content={artifact.content}
              subtitle={artifact.subtitle}
              index={i}
            />
          ))}
        </div>
      )}

      {extraction.development_signals && (
        <div className="mt-6">
          <DevelopmentSignals signals={extraction.development_signals} extraction={extraction} />
        </div>
      )}

      {extraction.suggested_tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {extraction.suggested_tags.map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      <div className="mt-10 pt-8 border-t border-border/30 space-y-10">
        <ExtractionOutcome extraction={extraction} />
        <ExtractionArtifacts extraction={extraction} />
        <ExtractionNotes extraction={extraction} />
        <ExtractionReferences extraction={extraction} />
        <ExtractionInfluencedProjects extraction={extraction} />
      </div>

      <RelatedDiscoveries extraction={extraction} allExtractions={allExtractions} />

    </div>
  );
}