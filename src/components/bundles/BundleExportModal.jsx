import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { X, Copy, Check, FileText, Code2, AlignLeft, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const ITEM_TYPE_LABELS = {
  extraction: "Extraction",
  penfire: "Recurring Pattern",
  project: "Project Canon",
  artifact: "Artifact",
  signal: "Emerging Signal",
  mission_alignment: "Mission Alignment",
  custom_note: "Custom Note",
};

function buildPlainText(bundle, resolvedItems) {
  const lines = [];
  lines.push(`=== CONTEXT BUNDLE: ${bundle.title} ===`);
  if (bundle.purpose) lines.push(`Purpose: ${bundle.purpose}`);
  lines.push(`Type: ${bundle.bundle_type}`);
  lines.push(`Items: ${(bundle.items || []).length}`);
  lines.push("");

  if (bundle.custom_instructions) {
    lines.push("--- INSTRUCTIONS ---");
    lines.push(bundle.custom_instructions);
    lines.push("");
  }

  resolvedItems.forEach((item) => {
    lines.push(`--- ${ITEM_TYPE_LABELS[item.item_type] || item.item_type}: ${item.label} ---`);
    lines.push(item.content_snapshot || "(no content)");
    lines.push("");
  });

  return lines.join("\n");
}

function buildMarkdown(bundle, resolvedItems) {
  const lines = [];
  lines.push(`# Context Bundle: ${bundle.title}`);
  if (bundle.purpose) lines.push(`> ${bundle.purpose}`);
  lines.push("");

  if (bundle.custom_instructions) {
    lines.push("## 📋 Instructions");
    lines.push(bundle.custom_instructions);
    lines.push("");
  }

  resolvedItems.forEach((item) => {
    lines.push(`## ${ITEM_TYPE_LABELS[item.item_type] || item.item_type}: ${item.label}`);
    lines.push(item.content_snapshot || "*No content available.*");
    lines.push("");
  });

  return lines.join("\n");
}

function buildLLMPrompt(bundle, resolvedItems) {
  const lines = [];
  lines.push("You are about to begin a creative/intellectual collaboration. Before we start, here is all the context you need:");
  lines.push("");
  lines.push(`**Project:** ${bundle.title}`);
  if (bundle.purpose) lines.push(`**Our goal today:** ${bundle.purpose}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  if (bundle.custom_instructions) {
    lines.push("**Important Instructions:**");
    lines.push(bundle.custom_instructions);
    lines.push("");
    lines.push("---");
    lines.push("");
  }

  lines.push("**Context:**");
  lines.push("");
  resolvedItems.forEach((item) => {
    lines.push(`**${ITEM_TYPE_LABELS[item.item_type] || item.item_type} — ${item.label}:**`);
    lines.push(item.content_snapshot || "(no content)");
    lines.push("");
  });

  lines.push("---");
  lines.push("");
  lines.push("With this context in mind, let's begin. Please confirm you have understood the above before we proceed.");

  return lines.join("\n");
}

export default function BundleExportModal({ bundle, onClose }) {
  const [format, setFormat] = useState("llm");
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();

  const items = bundle.items || [];

  const getOutput = () => {
    switch (format) {
      case "plain": return buildPlainText(bundle, items);
      case "markdown": return buildMarkdown(bundle, items);
      case "llm": return buildLLMPrompt(bundle, items);
      default: return "";
    }
  };

  const output = getOutput();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track use count
    await base44.entities.ContextBundle.update(bundle.id, {
      use_count: (bundle.use_count || 0) + 1,
      last_used: new Date().toISOString(),
    });
    queryClient.invalidateQueries({ queryKey: ["context-bundles"] });
  };

  const formatOptions = [
    { key: "llm", label: "LLM Prompt", icon: Code2, desc: "Ready to paste into any AI chat" },
    { key: "markdown", label: "Markdown", icon: AlignLeft, desc: "Formatted for Obsidian, Notion, etc." },
    { key: "plain", label: "Plain Text", icon: FileText, desc: "Universal, no formatting" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
          <div>
            <h2 className="font-display text-xl text-foreground">Export Bundle</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{bundle.title} · {items.length} items</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Format selector */}
        <div className="px-6 py-4 border-b border-border/20 flex gap-2">
          {formatOptions.map(opt => (
            <button
              key={opt.key}
              onClick={() => setFormat(opt.key)}
              className={`flex-1 p-3 rounded-xl border text-left transition-all ${format === opt.key ? "border-primary/40 bg-primary/8 text-foreground" : "border-border/30 bg-muted/20 text-muted-foreground hover:border-border/50"}`}
            >
              <div className="flex items-center gap-1.5 mb-1">
                <opt.icon className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">{opt.label}</span>
              </div>
              <p className="text-[10px] leading-snug">{opt.desc}</p>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <pre className="text-xs text-foreground/75 whitespace-pre-wrap font-mono leading-relaxed bg-muted/20 rounded-xl p-4 border border-border/20">
            {output}
          </pre>
        </div>

        <div className="px-6 py-4 border-t border-border/30">
          <Button onClick={handleCopy} className="w-full gap-2">
            {copied ? <><Check className="w-4 h-4" />Copied!</> : <><Copy className="w-4 h-4" />Copy to Clipboard</>}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}