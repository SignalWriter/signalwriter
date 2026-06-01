import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Copy, Check, X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGNALWRITER_PRIMER } from "./PrimerPrompt";

const CHECKLIST = [
  "Install prompt in ChatGPT, Claude, Gemini, or Grok",
  'Use "Extract for SignalWriter" when a conversation feels significant',
  "Paste the extraction into SignalWriter",
  "Let MIRA preserve, connect, and track your discoveries",
];

export default function PrimerModal({ onDismiss }) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(SIGNALWRITER_PRIMER);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([SIGNALWRITER_PRIMER], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "SignalWriter-AI-Primer-Prompt.txt";
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const toggleCheck = (i) => {
    setCheckedItems(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
    );
  };

  const hasActed = copied || downloaded;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={hasActed ? onDismiss : undefined}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="relative z-10 w-full max-w-lg bg-card border border-border/60 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Top accent bar */}
          <div className="h-0.5 bg-gradient-to-r from-primary/60 via-primary to-primary/30" />

          <div className="p-7">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-medium mb-0.5">Setup</p>
                  <h2 className="font-display text-xl text-foreground">Install Your AI Primer</h2>
                </div>
              </div>
              {hasActed && (
                <button
                  onClick={onDismiss}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted/50"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Explanation */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Install this prompt into your preferred AI platform. Once installed, you can use the command{" "}
              <span className="text-foreground font-medium font-mono text-xs bg-muted/60 px-1.5 py-0.5 rounded">
                Extract for SignalWriter
              </span>{" "}
              to generate SignalWriter-compatible extractions from conversations, notes, journals, transcripts, and thought dumps.
            </p>

            {/* Action buttons */}
            <div className="flex gap-3 mb-7">
              <Button
                onClick={handleDownload}
                className="flex-1 gap-2 h-11"
                variant={downloaded ? "outline" : "default"}
              >
                {downloaded ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Downloaded</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    📥 Download AI Primer Prompt
                  </>
                )}
              </Button>
              <Button
                onClick={handleCopy}
                variant="outline"
                className={`gap-2 h-11 transition-all ${copied ? "text-emerald-400 border-emerald-400/40 bg-emerald-400/5" : ""}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>

            {/* Checklist */}
            <div className="border-t border-border/30 pt-5">
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">
                Quick Setup Guide
              </p>
              <div className="space-y-2.5">
                {CHECKLIST.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => toggleCheck(i)}
                    className="w-full flex items-center gap-3 text-left group"
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                      checkedItems.includes(i)
                        ? "bg-emerald-500/20 border-emerald-500/50"
                        : "border-border/50 group-hover:border-border"
                    }`}>
                      {checkedItems.includes(i) && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                    </div>
                    <span className={`text-sm transition-colors ${
                      checkedItems.includes(i)
                        ? "text-muted-foreground line-through"
                        : "text-foreground/80 group-hover:text-foreground"
                    }`}>
                      {item}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer CTA */}
            <div className="mt-6">
              {hasActed ? (
                <Button onClick={onDismiss} variant="ghost" className="w-full text-muted-foreground hover:text-foreground text-sm">
                  Enter SignalWriter →
                </Button>
              ) : (
                <p className="text-center text-xs text-muted-foreground/50">
                  Download or copy the primer to continue
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}