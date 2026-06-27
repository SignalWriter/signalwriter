import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookMarked, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";

const SOURCE_TYPES = [
  { value: "conversation", label: "Conversation" },
  { value: "transcript", label: "Transcript" },
  { value: "note", label: "Note" },
  { value: "article", label: "Article" },
  { value: "journal", label: "Journal Entry" },
  { value: "thought_dump", label: "Thought Dump" },
  { value: "other", label: "Other" },
];

const PLATFORMS = ["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity", "NotebookLM", "Obsidian", "Manual Entry", "Other"];

export default function CanonUpdateInput() {
  const projectId = window.location.pathname.split("/").pop();
  const navigate = useNavigate();
  const [sourceText, setSourceText] = useState("");
  const [sourceType, setSourceType] = useState("conversation");
  const [sourcePlatform, setSourcePlatform] = useState("");
  const [showMeta, setShowMeta] = useState(false);

  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => { const list = await base44.entities.Project.filter({ id: projectId }); return list[0]; },
    enabled: !!projectId,
  });

  const { data: previousUpdates = [] } = useQuery({
    queryKey: ["canon-updates", projectId],
    queryFn: () => base44.entities.CanonUpdate.filter({ project_id: projectId }, "-created_date", 5),
    enabled: !!projectId,
  });

  const canonMutation = useMutation({
    mutationFn: async () => {
      const currentCanon = project?.canon_summary || "No existing canon summary.";
      const existingEntries = (project?.canon_entries || []).map(e => `[${e.category}] ${e.name}: ${e.description}`).join("\n") || "No existing canon entries.";
      const prevUpdatesContext = previousUpdates.length > 0
        ? previousUpdates.slice(0, 3).map(u => `- ${u.canon_changes || "(no summary)"}`).join("\n")
        : "No previous updates.";

      const result = await base44.integrations.Core.InvokeLLM({
        model: "claude_sonnet_4_6",
        prompt: `You are SignalWriter MIRA — the keeper of a living Canon for a creative project.

A new conversation has arrived for project: "${project?.title || "Untitled Project"}"

PROJECT DESCRIPTION: ${project?.description || "No description."}

CURRENT CANON SUMMARY:
${currentCanon}

EXISTING CANON ENTRIES:
${existingEntries}

PREVIOUS CANON UPDATES (recent context):
${prevUpdatesContext}

---

NEW CONVERSATION TO PROCESS:
${sourceText}

---

Your task: Determine how this conversation changes, clarifies, expands, or contradicts the project's current understanding. Think like the keeper of a living canon.

Return a structured JSON canon update with ALL of the following fields:

1. canon_changes: What has become newly true. What previous assumptions changed. What should now be considered current canon. (paragraph)

2. new_canon_entries: Array of new canonical items discovered. Each must have: category (one of: Character, Concept, Terminology, Location, System, Relationship, Rule, Theme, Framework, Other), name, description (concise canonical description), confidence (High/Medium/Low).

3. canon_updates: Array of existing ideas that evolved. Each has: name (existing entry name), delta (precisely how it changed — not a full rewrite, only the delta).

4. relationships: How this conversation strengthens or changes relationships between existing canon — characters, ideas, projects, systems, philosophies. Show connections.

5. contradictions: Any contradictions, competing interpretations, open philosophical questions, or things intentionally unresolved. Do not resolve unless the conversation clearly does.

6. timeline_notes: Important moments introduced or clarified. If this changes project chronology, note it.

7. references: Array of books, articles, videos, historical events, mythologies, technologies, or external sources that should be attached to this project. Each has: title, type, relevance.

8. influenced_projects: Other projects or creative threads that may be affected. Each has: name, reason.

9. canon_summary: A complete rewrite of the project's current state of knowledge as if someone opened the project for the first time today. This represents the project, not the conversation. Synthesis, not repetition. Living identity, not static documentation.

10. suggested_queries: 5-7 useful future questions someone could ask the Canon. Examples: "Who is...", "How has... changed", "What became of...", "Trace the emergence of...", "Compare..."

11. open_threads: Array of strings — everything still developing. Questions, missing pieces, future conversations, research, potential stories, unfinished systems.

12. confidence_notes: For every major update or new entry, note High/Medium/Low confidence and why.

13. mira_note: MIRA's single oracular observation about why this canon update matters for the project's future. Not a summary. A statement of significance.

Guiding principles: Archive remembers what happened. Extracts remember what was discovered. Canon remembers what has become true. Preserve continuity. Prefer synthesis over repetition. Favor living identity over static documentation.`,
        response_json_schema: {
          type: "object",
          properties: {
            canon_changes: { type: "string" },
            new_canon_entries: { type: "array", items: { type: "object", properties: { category: { type: "string" }, name: { type: "string" }, description: { type: "string" }, confidence: { type: "string" } } } },
            canon_updates: { type: "array", items: { type: "object", properties: { name: { type: "string" }, delta: { type: "string" } } } },
            relationships: { type: "string" },
            contradictions: { type: "string" },
            timeline_notes: { type: "string" },
            references: { type: "array", items: { type: "object", properties: { title: { type: "string" }, type: { type: "string" }, relevance: { type: "string" } } } },
            influenced_projects: { type: "array", items: { type: "object", properties: { name: { type: "string" }, reason: { type: "string" } } } },
            canon_summary: { type: "string" },
            suggested_queries: { type: "array", items: { type: "string" } },
            open_threads: { type: "array", items: { type: "string" } },
            confidence_notes: { type: "string" },
            mira_note: { type: "string" },
          }
        }
      });

      // Save the canon update record
      const update = await base44.entities.CanonUpdate.create({
        project_id: projectId,
        source_text: sourceText,
        source_type: sourceType,
        source_platform: sourcePlatform || undefined,
        canon_changes: result.canon_changes,
        new_canon_entries: result.new_canon_entries,
        canon_updates: result.canon_updates,
        relationships: result.relationships,
        contradictions: result.contradictions,
        timeline_notes: result.timeline_notes,
        references: result.references,
        influenced_projects: result.influenced_projects,
        canon_summary: result.canon_summary,
        suggested_queries: result.suggested_queries,
        open_threads: result.open_threads,
        confidence_notes: result.confidence_notes,
        mira_note: result.mira_note,
      });

      // Merge new entries into project canon and update the summary
      const existingIds = new Set((project?.canon_entries || []).map(e => e.name?.toLowerCase()));
      const trulyNew = (result.new_canon_entries || []).filter(e => !existingIds.has(e.name?.toLowerCase()));
      const mergedEntries = [
        ...(project?.canon_entries || []),
        ...trulyNew.map(e => ({ id: Math.random().toString(36).slice(2, 10), ...e, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })),
      ];

      // Merge open threads
      const existingThreadContents = new Set((project?.open_threads || []).map(t => t.content));
      const newThreads = (result.open_threads || []).filter(t => !existingThreadContents.has(t)).map(t => ({ id: Math.random().toString(36).slice(2, 10), content: t, created_at: new Date().toISOString() }));

      await base44.entities.Project.update(projectId, {
        canon_summary: result.canon_summary,
        canon_entries: mergedEntries,
        suggested_canon_queries: result.suggested_queries,
        open_threads: [...(project?.open_threads || []), ...newThreads],
      });

      return update;
    },
    onSuccess: (update) => navigate(`/canon-result/${update.id}`),
  });

  if (!project) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center gap-3 mb-8">
        <Link to={`/project/${projectId}`} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> {project.title}
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-2 mb-2">
          <BookMarked className="w-5 h-5 text-primary" />
          <h1 className="font-display text-3xl text-foreground">Canon Update</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Paste a conversation. MIRA will determine how it changes the living canon of <span className="text-foreground/70 italic">{project.title}</span>.
        </p>
      </motion.div>

      <div className="space-y-5">
        <div className="flex flex-wrap gap-3 items-center">
          <Select value={sourceType} onValueChange={setSourceType}>
            <SelectTrigger className="w-44 bg-card/50"><SelectValue /></SelectTrigger>
            <SelectContent>{SOURCE_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={sourcePlatform} onValueChange={setSourcePlatform}>
            <SelectTrigger className="w-44 bg-card/50"><SelectValue placeholder="Platform" /></SelectTrigger>
            <SelectContent>{PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        {/* Existing Canon Preview */}
        {(project.canon_summary || (project.canon_entries || []).length > 0) && (
          <div className="border border-border/30 rounded-lg overflow-hidden">
            <button type="button" onClick={() => setShowMeta(v => !v)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/20 transition-colors">
              <span className="text-xs text-muted-foreground">▸ Current Canon Context</span>
              <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground/50 transition-transform duration-200 ${showMeta ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {showMeta && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 border-t border-border/20 space-y-3">
                    {project.canon_summary && <p className="text-xs text-muted-foreground/80 leading-relaxed italic">{project.canon_summary}</p>}
                    {(project.canon_entries || []).length > 0 && (
                      <p className="text-[10px] text-muted-foreground/50">{project.canon_entries.length} existing canon entries will be considered.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        <Textarea
          value={sourceText}
          onChange={e => setSourceText(e.target.value)}
          placeholder="Paste your conversation, transcript, journal entry, or notes here. MIRA will read it against the living canon and determine what changed..."
          className="min-h-[320px] bg-card/50 border-border/50 focus:border-primary/40 text-sm leading-relaxed resize-y font-body"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{sourceText.length > 0 ? `${sourceText.split(/\s+/).filter(Boolean).length} words` : ""}</span>
          <Button onClick={() => canonMutation.mutate()} disabled={!sourceText.trim() || canonMutation.isPending} className="gap-2 px-6" size="lg">
            {canonMutation.isPending ? <><Loader2 className="w-4 h-4 animate-spin" />MIRA is reading the canon...</> : <><BookMarked className="w-4 h-4" />Update Canon</>}
          </Button>
        </div>
      </div>
    </div>
  );
}