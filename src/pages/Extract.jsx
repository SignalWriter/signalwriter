import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Sparkles, PenTool } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import ArtifactCard from "@/components/extraction/ArtifactCard";
import MiraNote from "@/components/extraction/MiraNote";
import TagBadge from "@/components/shared/TagBadge";

const SOURCE_TYPES = [
  { value: "conversation", label: "Conversation" },
  { value: "transcript", label: "Transcript" },
  { value: "note", label: "Note" },
  { value: "article", label: "Article" },
  { value: "journal", label: "Journal Entry" },
  { value: "thought_dump", label: "Thought Dump" },
  { value: "other", label: "Other" },
];

const PLATFORMS = [
  "ChatGPT", "Claude", "Gemini", "Grok", "Manual Entry", "Other"
];

export default function Extract() {
  const [sourceText, setSourceText] = useState("");
  const [sourceType, setSourceType] = useState("other");
  const [sourcePlatform, setSourcePlatform] = useState("");
  const [threadTitle, setThreadTitle] = useState("");
  const [originalDate, setOriginalDate] = useState("");
  const [sourceLink, setSourceLink] = useState("");
  const [extractedData, setExtractedData] = useState(null);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: existingExtractions = [] } = useQuery({
    queryKey: ["all-extractions-for-context"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 20),
  });

  const extractMutation = useMutation({
    mutationFn: async () => {
      const existingContext = existingExtractions.length > 0
        ? `\n\nEXISTING ARCHIVE CONTEXT (for pattern detection):\n${existingExtractions.map(e =>
            `- "${e.title}": ${e.core_insight || ""} | Tags: ${(e.suggested_tags || []).join(", ")}`
          ).join("\n")}`
        : "";

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are MIRA, the Archivist for SignalWriter — a continuity engine that preserves discoveries from conversations, notes, and thought dumps.

Analyze the following ${sourceType.replace("_", " ")} and extract meaningful artifacts. Focus on SIGNAL, not noise. Preserve what matters.

SOURCE TEXT:
${sourceText}
${existingContext}

Extract the following artifacts. Be precise, insightful, and preserve the writer's voice:

1. TITLE: A concise, evocative title for this extraction (max 8 words)
2. CORE INSIGHT: The single most important realization or discovery in this text
3. THOUGHT SEEDS: Small observations worth preserving (1-5 items)
4. FRAMEWORK SEEDS: Principles, models, distinctions, or methodologies found (0-3 items)
5. STORY SEEDS: Premises, characters, conflicts, themes, or narrative opportunities (0-3 items)
6. PROJECT IMPLICATIONS: Features, workflows, business opportunities, or implementation ideas (0-3 items)
7. QUOTABLE LINES: Phrases worth remembering verbatim from the source (0-5 items)
8. EMERGING PATTERNS: Themes or recurring ideas you detect (0-3 items)
9. OPEN LOOPS: Unresolved questions or unfinished threads (0-3 items)
10. SUGGESTED TAGS: Keywords for categorization (3-7 tags)
11. MIRA NOTE: As the Archivist, write one observation about this extraction. If you detect connections to existing archive items, mention them. Examples: "This thought appears connected to an earlier insight." "This concept may be a recurring theme." "This may be a Penfire."

Be selective. Only extract what truly has signal. Empty arrays are better than noise.`,
        response_json_schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            core_insight: { type: "string" },
            thought_seeds: {
              type: "array",
              items: { type: "object", properties: { content: { type: "string" }, context: { type: "string" } } }
            },
            framework_seeds: {
              type: "array",
              items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } }
            },
            story_seeds: {
              type: "array",
              items: { type: "object", properties: { premise: { type: "string" }, elements: { type: "string" } } }
            },
            project_implications: {
              type: "array",
              items: { type: "object", properties: { idea: { type: "string" }, domain: { type: "string" } } }
            },
            quotable_lines: { type: "array", items: { type: "string" } },
            emerging_patterns: { type: "array", items: { type: "string" } },
            open_loops: {
              type: "array",
              items: { type: "object", properties: { question: { type: "string" }, context: { type: "string" } } }
            },
            suggested_tags: { type: "array", items: { type: "string" } },
            mira_note: { type: "string" },
          },
        },
      });
      return result;
    },
    onSuccess: (data) => {
      setExtractedData(data);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const extraction = await base44.entities.Extraction.create({
        title: extractedData.title,
        source_text: sourceText,
        source_type: sourceType,
        source_platform: sourcePlatform || undefined,
        source_thread_title: threadTitle || undefined,
        source_original_date: originalDate || undefined,
        source_link: sourceLink || undefined,
        core_insight: extractedData.core_insight,
        thought_seeds: extractedData.thought_seeds,
        framework_seeds: extractedData.framework_seeds,
        story_seeds: extractedData.story_seeds,
        project_implications: extractedData.project_implications,
        quotable_lines: extractedData.quotable_lines,
        emerging_patterns: extractedData.emerging_patterns,
        open_loops: extractedData.open_loops,
        suggested_tags: extractedData.suggested_tags,
        mira_note: extractedData.mira_note,
      });
      return extraction;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["extractions"] });
      queryClient.invalidateQueries({ queryKey: ["all-extractions-for-context"] });
      navigate(`/extraction/${data.id}`);
    },
  });

  const allArtifacts = extractedData ? [
    ...(extractedData.thought_seeds || []).map(s => ({ type: "thought_seed", content: s.content, subtitle: s.context })),
    ...(extractedData.framework_seeds || []).map(s => ({ type: "framework_seed", title: s.name, content: s.description })),
    ...(extractedData.story_seeds || []).map(s => ({ type: "story_seed", content: s.premise, subtitle: s.elements })),
    ...(extractedData.project_implications || []).map(s => ({ type: "project_implication", content: s.idea, subtitle: s.domain })),
    ...(extractedData.quotable_lines || []).map(q => ({ type: "quotable", content: `"${q}"` })),
    ...(extractedData.emerging_patterns || []).map(p => ({ type: "pattern", content: p })),
    ...(extractedData.open_loops || []).map(l => ({ type: "open_loop", content: l.question, subtitle: l.context })),
  ] : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Extract</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Paste your content. MIRA will extract what matters.
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!extractedData ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-5"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Select value={sourceType} onValueChange={setSourceType}>
                  <SelectTrigger className="w-44 bg-card/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCE_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sourcePlatform} onValueChange={setSourcePlatform}>
                  <SelectTrigger className="w-44 bg-card/50">
                    <SelectValue placeholder="Platform (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-wrap gap-3">
                <Input
                  value={threadTitle}
                  onChange={(e) => setThreadTitle(e.target.value)}
                  placeholder="Thread title (optional)"
                  className="flex-1 min-w-[200px] bg-card/50 border-border/50 text-sm"
                />
                <Input
                  type="date"
                  value={originalDate}
                  onChange={(e) => setOriginalDate(e.target.value)}
                  className="w-44 bg-card/50 border-border/50 text-sm"
                  title="Original date (optional)"
                />
                <Input
                  value={sourceLink}
                  onChange={(e) => setSourceLink(e.target.value)}
                  placeholder="Source link (optional)"
                  className="flex-1 min-w-[200px] bg-card/50 border-border/50 text-sm"
                />
              </div>
            </div>

            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Paste a conversation, transcript, journal entry, note, article, or thought dump here..."
              className="min-h-[300px] bg-card/50 border-border/50 focus:border-primary/40 text-sm leading-relaxed resize-y font-body"
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {sourceText.length > 0 ? `${sourceText.split(/\s+/).filter(Boolean).length} words` : ""}
              </span>
              <Button
                onClick={() => extractMutation.mutate()}
                disabled={!sourceText.trim() || extractMutation.isPending}
                className="gap-2 px-6"
                size="lg"
              >
                {extractMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    MIRA is reading...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Extract for SignalWriter
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {/* Title & Core Insight */}
            <div className="space-y-4">
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="font-display text-2xl text-foreground"
              >
                {extractedData.title}
              </motion.h2>

              {extractedData.core_insight && (
                <ArtifactCard
                  type="insight"
                  content={extractedData.core_insight}
                  index={0}
                />
              )}
            </div>

            {/* MIRA Note */}
            <MiraNote message={extractedData.mira_note} />

            {/* All Artifacts */}
            {allArtifacts.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {allArtifacts.map((artifact, i) => (
                  <ArtifactCard
                    key={i}
                    type={artifact.type}
                    title={artifact.title}
                    content={artifact.content}
                    subtitle={artifact.subtitle}
                    index={i + 1}
                  />
                ))}
              </div>
            )}

            {/* Tags */}
            {extractedData.suggested_tags?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-2"
              >
                {extractedData.suggested_tags.map(tag => (
                  <TagBadge key={tag} tag={tag} />
                ))}
              </motion.div>
            )}

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-3 pt-4 border-t border-border/30"
            >
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="gap-2 px-6"
                size="lg"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PenTool className="w-4 h-4" />
                )}
                Save to Archive
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setExtractedData(null);
                  setSourceText("");
                }}
                className="text-muted-foreground"
              >
                Start Over
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}