import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export default function MiraNote({ message }) {
  if (!message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-xl border border-primary/20 bg-primary/5 p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-primary font-medium mb-1">MIRA — Archivist</p>
          <p className="text-sm text-foreground/80 leading-relaxed italic">{message}</p>
        </div>
      </div>
    </motion.div>
  );
}