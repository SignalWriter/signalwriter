import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Copy, Check, X, ExternalLink, Zap } from "lucide-react";
import { toast } from "sonner";

const CONTINUE_OPTIONS = [
  {
    label: "ChatGPT",
    url: (prompt) => `https://chat.openai.com/?q=${encodeURIComponent(prompt)}`,
  },
  {
    label: "Claude",
    url: (prompt) => `https://claude.ai/new?q=${encodeURIComponent(prompt)}`,
  },
  {
    label: "Gemini",
    url: (prompt) => `https://gemini.google.com/app?q=${encodeURIComponent(prompt)}`,
  },
  {
    label: "Hook Engine",
    url: () => null, // Internal — copy only
  },
];

export default function DevelopModal({ form, extraction, onClose }) {
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setIsGenerating(true);

    const themes = [
      ...(extraction.emerging_patterns || []),
      ...(extraction.suggested_tags || []),
    ].slice(0, 6);

    const thoughtSeedsText = (extraction.thought_seeds || [])
      .map((s) => `- ${s.content}`)
      .join("\n");

    const notesText = (extraction.notes || [])
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((n) => `- ${n.content}`)
      .join("\n");

    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `You are MIRA, the Archivist for SignalWriter. Your role is to package a discovery for continuation, not to generate finished content.

The user wants to develop the following extraction as a ${form}.

EXTRACTION TITLE: ${extraction.title}
CORE INSIGHT: ${extraction.core_insight || ""}
EMERGING PATTERNS: ${themes.join(", ")}
THOUGHT SEEDS:
${thoughtSeedsText}
MIRA NOTE: ${extraction.mira_note || ""}${notesText ? `\nUSER NOTES (thoughts captured after extraction):\n${notesText}` : ""}

Generate a Context Transfer Package with the following fields:

1. core_insight — one sentence. The central discovery being developed.
2. key_themes — array of 3–6 concise theme labels.
3. relevant_context — 2–3 sentences of important background from this extraction.
4. suggested_direction — one clear sentence recommending how to explore this further as a ${form}.
5. context_transfer_prompt — A complete, rich prompt designed to help another AI or writing workspace continue developing this discovery as a ${form}. The prompt should:
   - Open with a clear instruction for writing a ${form}
   - State the core insight
   - Reference the key themes
   - Mention the relevant context
   - Include the suggested direction
   - Close with: "Preserve the original framing and language wherever possible."
   Do NOT write the ${form} itself. Write the prompt that will generate it.

Return as structured JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          core_insight: { type: "string" },
          key_themes: { type: "array", items: { type: "string" } },
          relevant_context: { type: "string" },
          suggested_direction: { type: "string" },
          context_transfer_prompt: { type: "string" },
        },
      },
    });

    setResult(data);
    setIsGenerating(false);
  };

  const handleCopy = async () => {
    if (!result?.context_transfer_prompt) return;
    await navigator.clipboard.writeText(result.context_transfer_prompt);
    setCopied(true);
    toast.success("Prompt copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = (option) => {
    if (!result?.context_transfer_prompt) return;
    const url = option.url(result.context_transfer_prompt);
    if (url) {
      window.open(url, "_blank");
    } else {
      // Hook Engine — copy prompt and notify
      handleCopy();
      toast.info("Prompt copied. Paste into Hook Engine to continue.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-violet-400 font-medium">
              Develop · {form}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Pre-generate state */}
          {!result && !isGenerating && (
            <div className="text-center py-8 space-y-4">
              <p className="font-display text-xl text-foreground">
                Package this discovery for {form}
              </p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
                MIRA will generate a Context Transfer Prompt — packaging the signal, themes, and intent so you can continue this work in any workspace.
              </p>
              <Button onClick={generate} className="gap-2 mt-2">
                <Zap className="w-4 h-4" />
                Generate Context Transfer
              </Button>
            </div>
          )}

          {/* Generating */}
          {isGenerating && (
            <div className="text-center py-12 space-y-3">
              <Loader2 className="w-6 h-6 animate-spin text-violet-400 mx-auto" />
              <p className="text-sm text-muted-foreground">MIRA is packaging the signal...</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Header label */}
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-mono mb-1">
                  {form.toUpperCase()} DEVELOPMENT PROMPT
                </p>
              </div>

              {/* Core Insight */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.12em] text-amber-400 font-medium">Core Insight</p>
                <p className="text-sm text-foreground leading-relaxed">{result.core_insight}</p>
              </div>

              {/* Key Themes */}
              {result.key_themes?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-violet-400 font-medium">Key Themes</p>
                  <div className="flex flex-wrap gap-2">
                    {result.key_themes.map((theme) => (
                      <span
                        key={theme}
                        className="text-xs px-2.5 py-1 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-300"
                      >
                        {theme}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Relevant Context */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">Relevant Context</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{result.relevant_context}</p>
              </div>

              {/* Suggested Direction */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.12em] text-primary font-medium">Suggested Direction</p>
                <p className="text-sm text-foreground/80 leading-relaxed italic">{result.suggested_direction}</p>
              </div>

              {/* Context Transfer Prompt */}
              <div className="space-y-2">
                <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium">Context Transfer Prompt</p>
                <div className="rounded-xl bg-muted/30 border border-border/40 p-4">
                  <pre className="text-sm text-foreground/90 font-body whitespace-pre-wrap leading-relaxed">
                    {result.context_transfer_prompt}
                  </pre>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-border/30 space-y-3">
                {/* Copy */}
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="w-full gap-2"
                >
                  {copied ? (
                    <><Check className="w-4 h-4 text-emerald-400" /> Copied!</>
                  ) : (
                    <><Copy className="w-4 h-4" /> 📋 Copy Prompt</>
                  )}
                </Button>

                {/* Continue options */}
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground font-medium mb-2">🚀 Continue Development</p>
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
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}