import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SOURCE_TYPES = ["conversation", "transcript", "note", "article", "journal", "thought_dump", "other"];
const PLATFORMS = ["ChatGPT", "Claude", "Gemini", "Grok", "Perplexity", "NotebookLM", "Obsidian", "Manual Entry", "Other"];

export default function QuickCaptureModal({ onClose }) {
  const [step, setStep] = useState("meta"); // "meta" | "text"
  const [sourceType, setSourceType] = useState("");
  const [platform, setPlatform] = useState("");
  const [threadTitle, setThreadTitle] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleMetaNext = () => {
    if (!sourceType) return;
    setStep("text");
  };

  const handleArchive = async () => {
    if (!sourceText.trim()) return;
    setIsProcessing(true);

    const themes = [];
    const data = await base44.integrations.Core.InvokeLLM({
      prompt: `You are MIRA. Extract structured knowledge from the following source material.

SOURCE TYPE: ${sourceType}
PLATFORM: ${platform || "unspecified"}
THREAD/TITLE: ${threadTitle || "untitled"}

SOURCE TEXT:
${sourceText}

Extract and return structured JSON.`,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          core_insight: { type: "string" },
          thought_seeds: { type: "array", items: { type: "object", properties: { content: { type: "string" }, context: { type: "string" } } } },
          framework_seeds: { type: "array", items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } } },
          story_seeds: { type: "array", items: { type: "object", properties: { premise: { type: "string" }, elements: { type: "string" } } } },
          project_implications: { type: "array", items: { type: "object", properties: { idea: { type: "string" }, domain: { type: "string" } } } },
          quotable_lines: { type: "array", items: { type: "string" } },
          emerging_patterns: { type: "array", items: { type: "string" } },
          open_loops: { type: "array", items: { type: "object", properties: { question: { type: "string" }, context: { type: "string" } } } },
          suggested_tags: { type: "array", items: { type: "string" } },
          development_signals: { type: "object", properties: { potential_forms: { type: "array", items: { type: "string" } }, most_likely_next_step: { type: "string" } } },
          mira_note: { type: "string" },
        },
      },
    });

    const saved = await base44.entities.Extraction.create({
      ...data,
      source_text: sourceText,
      source_type: sourceType,
      source_platform: platform || undefined,
      source_thread_title: threadTitle || undefined,
    });

    queryClient.invalidateQueries({ queryKey: ["extractions"] });
    toast.success("Discovery archived.");
    onClose();
    navigate(`/extraction/${saved.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium">
              Quick Capture {step === "text" ? "· Paste Source" : "· Source Details"}
            </span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <AnimatePresence mode="wait">
            {step === "meta" && (
              <motion.div key="meta" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">Source Type <span className="text-destructive">*</span></p>
                  <div className="flex flex-wrap gap-2">
                    {SOURCE_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => setSourceType(t)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                          sourceType === t
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-muted/30 border-border/30 text-muted-foreground hover:border-border/60"
                        }`}
                      >
                        {t.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">Platform</p>
                  <div className="flex flex-wrap gap-2">
                    {PLATFORMS.map(p => (
                      <button
                        key={p}
                        onClick={() => setPlatform(p)}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                          platform === p
                            ? "bg-primary/15 border-primary/40 text-primary"
                            : "bg-muted/30 border-border/30 text-muted-foreground hover:border-border/60"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">Thread / Title <span className="text-muted-foreground/40">(optional)</span></p>
                  <input
                    type="text"
                    value={threadTitle}
                    onChange={e => setThreadTitle(e.target.value)}
                    placeholder="e.g. Conversation about creative emergence"
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors"
                    onKeyDown={e => e.key === "Enter" && handleMetaNext()}
                  />
                </div>

                <Button onClick={handleMetaNext} disabled={!sourceType} className="w-full gap-2">
                  Next — Paste Source
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}

            {step === "text" && (
              <motion.div key="text" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} className="space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-2">Source Material <span className="text-destructive">*</span></p>
                  <textarea
                    autoFocus
                    value={sourceText}
                    onChange={e => setSourceText(e.target.value)}
                    placeholder="Paste your conversation, transcript, note, or thought dump here..."
                    className="w-full bg-muted/30 border border-border/40 rounded-lg px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors resize-none font-mono leading-relaxed"
                    rows={10}
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setStep("meta")} className="shrink-0">
                    ← Back
                  </Button>
                  <Button
                    onClick={handleArchive}
                    disabled={!sourceText.trim() || isProcessing}
                    className="flex-1 gap-2"
                  >
                    {isProcessing ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> MIRA is extracting...</>
                    ) : (
                      "Archive Discovery"
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}