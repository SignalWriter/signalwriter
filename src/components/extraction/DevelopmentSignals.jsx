import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import DevelopModal from "./DevelopModal";

const ALL_FORMS = [
  "Article", "Essay", "Story", "Novel", "Video",
  "Product", "Presentation", "Research Thread", "Personal Reflection"
];

export default function DevelopmentSignals({ signals, extraction }) {
  const [developingForm, setDevelopingForm] = useState(null);

  if (!signals?.potential_forms?.length && !signals?.most_likely_next_step) return null;

  const activeForms = signals.potential_forms || [];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-violet-400/20 bg-violet-400/5 p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
          <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-violet-400">
            Development Signals
          </span>
        </div>

        {activeForms.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-2.5">Potential Forms</p>
            <div className="flex flex-wrap gap-2">
              {ALL_FORMS.map(form => {
                const active = activeForms.includes(form);
                return active ? (
                  <button
                    key={form}
                    onClick={() => setDevelopingForm(form)}
                    className="group flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all bg-violet-400/15 border-violet-400/30 text-violet-300 hover:bg-violet-400/25 hover:border-violet-400/50 cursor-pointer"
                    title={`Develop as ${form}`}
                  >
                    {form}
                    <span className="text-[9px] opacity-60 group-hover:opacity-100 transition-opacity font-mono uppercase tracking-wider">
                      develop →
                    </span>
                  </button>
                ) : (
                  <span
                    key={form}
                    className="text-xs px-2.5 py-1 rounded-full border bg-muted/30 border-border/20 text-muted-foreground/40"
                  >
                    {form}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {signals.most_likely_next_step && (
          <div>
            <p className="text-[10px] uppercase tracking-[0.1em] text-muted-foreground mb-1.5">Most Likely Next Step</p>
            <p className="text-sm text-foreground/80 leading-relaxed italic">
              {signals.most_likely_next_step}
            </p>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {developingForm && (
          <DevelopModal
            form={developingForm}
            extraction={extraction}
            onClose={() => setDevelopingForm(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}