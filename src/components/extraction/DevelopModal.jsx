import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, X, ExternalLink, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

const CONTINUE_OPTIONS = [
  { label: "ChatGPT", url: (p) => `https://chat.openai.com/?q=${encodeURIComponent(p)}` },
  { label: "Claude", url: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}` },
  { label: "Gemini", url: (p) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}` },
  { label: "Hook Engine", url: () => null },
];

function Section({ label, color = "text-muted-foreground", children }) {
  return (
    <div className="space-y-1.5">
      <p className={`text-[10px] uppercase tracking-[0.15em] font-medium ${color}`}>{label}</p>
      {children}
    </div>
  );
}

function Prose({ children }) {
  return <p className="text-sm text-foreground/80 leading-relaxed">{children}</p>;
}

function Divider() {
  return <div className="border-t border-border/25 my-1" />;
}

export default function DevelopModal({ form, extraction, onClose }) {
  const [workspace, setWorkspace] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [promptVisible, setPromptVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-generate on open
  useEffect(() => {
    generate();
  }, []);

  const generate = async () => {
    setIsGenerating(true);
    setWorkspace(null);

    const themes = [
      ...(extraction.emerging_patterns || []),
      ...(extraction.suggested_tags || []),
    ].slice(0, 8);

    const thoughtSeedsText = (extraction.thought_seeds || [])
      .map((s) => `- ${s.content}`)
      .join("\n");

    const notesText = (extraction.notes || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((n) => `- ${n.content}`)
      .join("\n");

    const openLoopsText = (extraction.open_loops || [])
      .map((l) => `- ${l.question}`)
      .join("\n");

    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `You are MIRA, the Archivist for SignalWriter. Your role is to restore the user's creative state — the exact mental and emotional landing where this discovery occurred — so they can re-enter it and develop from within it.

The user wants to develop this extraction as a: ${form}

EXTRACTION TITLE: ${extraction.title}
CORE INSIGHT: ${extraction.core_insight || ""}
EMERGING PATTERNS / TAGS: ${themes.join(", ")}
THOUGHT SEEDS:\n${thoughtSeedsText}
OPEN LOOPS:\n${openLoopsText}
MIRA NOTE: ${extraction.mira_note || ""}${notesText ? `\nUSER NOTES:\n${notesText}` : ""}

Generate a Development Workspace with the following sections:

1. LANDING RESTORATION
   - original_discovery: 2–3 sentences. What question started this? What problem was being solved? What sparked it?
   - why_it_mattered: 2–3 sentences. Why was this signal important? What risk, tension, or opportunity was identified?
   - what_changed: 1–2 sentences. The major shift or turning point in understanding.
   - emerging_insight: 1 sentence. The strongest distilled realization.

2. SIGNAL REHYDRATION
   - key_themes: array of 4–7 concise theme labels.
   - open_loops: array of 3–5 unanswered questions that feel like invitations, not conclusions.
   - at_this_landing: array of 3–6 short paragraphs (each 1–3 sentences). Reconstruct the creator's mindset and orientation at the moment this signal emerged. NOT a summary — a reconstruction of creative posture. Describe: what the creator was wrestling with, what assumptions were active, what tension or uncertainty existed, what direction the thinking was moving, the emotional energy (exploratory, investigative, frustrated, excited, uncertain, etc.). Ground every paragraph in the actual conversation context. Write as if helping Future Me remember where I was standing.
   - what_future_you_can_see: string. 3–5 sentences plus an array of concepts/frameworks that emerged later. How did this signal influence later discoveries? What did it become? What frameworks, projects, or recurring themes trace back here? Write as if the user is revisiting this on a spiral staircase with their current understanding.
   - continuity_traces: array of 3–6 short strings. Concepts, frameworks, or projects that later emerged from this signal (e.g. "Daemon Work", "Stable Communion", "CDCC Continuity Principles").
   - why_this_still_matters: string. 3–4 sentences covering: ongoing relevance, risks if forgotten, opportunities if revisited.

3. DEVELOPMENT SHAPE (lightweight form scaffold, NOT finished content)
   Generate a shape specific to: ${form}
   - shape_why: 1–2 sentences explaining WHY this signal is particularly suited to the ${form} format.
   - shape_title: a possible working title
   - shape_elements: an array of 4–6 structural elements appropriate for a ${form} (e.g. for Article: [core argument, major sections, potential conclusion]; for Story: [premise, character, conflict, discovery]; for Video: [hook, main idea, supporting points, call to reflection]; for Essay: [central reflection, personal tension, key insight, closing thought]; for Research Thread: [research question, key sources, hypotheses, open questions]; for Product: [user problem, insight, feature opportunity]; for Presentation: [opening frame, core claim, supporting points, closing provocation])

4. CONTINUATION PROMPT (the byproduct)
   - continuation_prompt: A complete, rich prompt packaging all of the above so another AI workspace can continue this work as a ${form}. Include the landing, the at_this_landing posture, the themes, the open loops, the shape. End with: "Preserve the original framing and language wherever possible."

Return as structured JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          original_discovery: { type: "string" },
          why_it_mattered: { type: "string" },
          what_changed: { type: "string" },
          emerging_insight: { type: "string" },
          key_themes: { type: "array", items: { type: "string" } },
          open_loops: { type: "array", items: { type: "string" } },
          at_this_landing: { type: "array", items: { type: "string" } },
          what_future_you_can_see: { type: "string" },
          continuity_traces: { type: "array", items: { type: "string" } },
          why_this_still_matters: { type: "string" },
          shape_why: { type: "string" },
          shape_title: { type: "string" },
          shape_elements: { type: "array", items: { type: "string" } },
          continuation_prompt: { type: "string" },
        },
      },
    });

    setWorkspace(data);
    setIsGenerating(false);
  };

  const handleContinue = (option) => {
    if (!workspace?.continuation_prompt) return;
    const url = option.url(workspace.continuation_prompt);
    if (url) {
      window.open(url, "_blank");
    } else {
      navigator.clipboard.writeText(workspace.continuation_prompt);
      toast.info("Prompt copied. Paste into Hook Engine to continue.");
    }
  };

  const handleCopyPrompt = async () => {
    if (!workspace?.continuation_prompt) return;
    await navigator.clipboard.writeText(workspace.continuation_prompt);
    setCopied(true);
    toast.success("Continuation prompt copied.");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-violet-400 font-medium">
              Development Workspace · {form}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto space-y-6">
          {/* Generating */}
          {isGenerating && (
            <div className="text-center py-16 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto" />
              <p className="text-sm text-muted-foreground">MIRA is restoring your landing...</p>
            </div>
          )}

          {workspace && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-7">

              {/* ── SECTION 1: Landing Restoration ── */}
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-violet-400/60 font-mono">§ 1 — Landing Restoration</p>

                <Section label="Original Discovery" color="text-amber-400/80">
                  <Prose>{workspace.original_discovery}</Prose>
                </Section>

                <Section label="Why It Mattered" color="text-muted-foreground">
                  <Prose>{workspace.why_it_mattered}</Prose>
                </Section>

                <Section label="What Changed" color="text-muted-foreground">
                  <Prose>{workspace.what_changed}</Prose>
                </Section>

                <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-primary/70 mb-1.5">Emerging Insight</p>
                  <p className="text-sm text-foreground leading-relaxed font-display italic">
                    {workspace.emerging_insight}
                  </p>
                </div>
              </div>

              <Divider />

              {/* ── SECTION 2: Signal Rehydration ── */}
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-violet-400/60 font-mono">§ 2 — Signal Rehydration</p>

                {workspace.key_themes?.length > 0 && (
                  <Section label="Key Themes" color="text-violet-400/80">
                    <div className="flex flex-wrap gap-2">
                      {workspace.key_themes.map((theme) => (
                        <span key={theme} className="text-xs px-2.5 py-1 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-300">
                          {theme}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {workspace.open_loops?.length > 0 && (
                  <Section label="Open Loops" color="text-muted-foreground">
                    <ul className="space-y-1.5">
                      {workspace.open_loops.map((loop, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/70 leading-relaxed">
                          <span className="text-primary/50 mt-0.5 shrink-0">◦</span>
                          {loop}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                {workspace.at_this_landing?.length > 0 && (
                  <div className="rounded-xl border border-amber-400/15 bg-amber-400/5 px-4 py-4 space-y-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-amber-400/70">At This Landing</p>
                    {workspace.at_this_landing.map((para, i) => (
                      <p key={i} className="text-sm text-foreground/75 leading-relaxed">{para}</p>
                    ))}
                  </div>
                )}

                {workspace.what_future_you_can_see && (
                  <div className="space-y-2">
                    <Section label="What Future You Can See Now" color="text-emerald-400/80">
                      <Prose>{workspace.what_future_you_can_see}</Prose>
                    </Section>
                    {workspace.continuity_traces?.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {workspace.continuity_traces.map((trace, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-300">
                            {trace}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {workspace.why_this_still_matters && (
                  <div className="rounded-xl border border-border/30 bg-muted/20 px-4 py-4">
                    <p className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground mb-2">Why This Still Matters</p>
                    <Prose>{workspace.why_this_still_matters}</Prose>
                  </div>
                )}
              </div>

              <Divider />

              {/* ── SECTION 3: Development Shape ── */}
              <div className="space-y-4">
                <p className="text-[9px] uppercase tracking-[0.2em] text-violet-400/60 font-mono">§ 3 — {form} Shape</p>

                {workspace.shape_why && (
                  <p className="text-xs text-muted-foreground/70 leading-relaxed italic border-l-2 border-violet-400/30 pl-3">
                    {workspace.shape_why}
                  </p>
                )}

                {workspace.shape_title && (
                  <Section label="Working Title" color="text-muted-foreground">
                    <p className="text-sm text-foreground font-display italic">"{workspace.shape_title}"</p>
                  </Section>
                )}

                {workspace.shape_elements?.length > 0 && (
                  <Section label="Shape" color="text-muted-foreground">
                    <ol className="space-y-1.5">
                      {workspace.shape_elements.map((el, i) => (
                        <li key={i} className="flex items-start gap-2.5 text-sm text-foreground/70 leading-relaxed">
                          <span className="text-[10px] text-muted-foreground/40 font-mono mt-0.5 shrink-0 w-4">{i + 1}.</span>
                          {el}
                        </li>
                      ))}
                    </ol>
                  </Section>
                )}


              </div>

              <Divider />

              {/* ── SECTION 4: Continuation Tools ── */}
              <div className="space-y-3">
                <p className="text-[9px] uppercase tracking-[0.2em] text-violet-400/60 font-mono">§ 4 — Continue Development</p>

                <div className="grid grid-cols-2 gap-2">
                  {CONTINUE_OPTIONS.map((opt) => (
                    <Button
                      key={opt.label}
                      variant="secondary"
                      size="sm"
                      className="gap-1.5 justify-start"
                      onClick={() => handleContinue(opt)}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      {opt.label}
                    </Button>
                  ))}
                </div>

                {/* Collapsible prompt */}
                <div className="rounded-xl border border-border/30 overflow-hidden">
                  <button
                    onClick={() => setPromptVisible(v => !v)}
                    className="w-full flex items-center justify-between px-4 py-2.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                  >
                    <span>View Continuation Prompt</span>
                    {promptVisible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                  <AnimatePresence>
                    {promptVisible && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-2 border-t border-border/20">
                          <pre className="text-xs text-foreground/70 font-body whitespace-pre-wrap leading-relaxed pt-3 max-h-48 overflow-y-auto">
                            {workspace.continuation_prompt}
                          </pre>
                          <Button
                            onClick={handleCopyPrompt}
                            variant="outline"
                            size="sm"
                            className="gap-1.5 w-full"
                          >
                            {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Prompt</>}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}