import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const typeStyles = {
  insight: { label: "Core Insight", color: "text-amber-400", bg: "bg-amber-400/5 border-amber-400/20" },
  thought_seed: { label: "Thought Seed", color: "text-emerald-400", bg: "bg-emerald-400/5 border-emerald-400/20" },
  framework_seed: { label: "Framework Seed", color: "text-blue-400", bg: "bg-blue-400/5 border-blue-400/20" },
  story_seed: { label: "Story Seed", color: "text-purple-400", bg: "bg-purple-400/5 border-purple-400/20" },
  project_implication: { label: "Project Implication", color: "text-cyan-400", bg: "bg-cyan-400/5 border-cyan-400/20" },
  open_loop: { label: "Open Loop", color: "text-rose-400", bg: "bg-rose-400/5 border-rose-400/20" },
  quotable: { label: "Quotable Line", color: "text-yellow-300", bg: "bg-yellow-300/5 border-yellow-300/20" },
  pattern: { label: "Emerging Pattern", color: "text-indigo-400", bg: "bg-indigo-400/5 border-indigo-400/20" },
};

export default function ArtifactCard({ type, title, content, subtitle, index = 0 }) {
  const style = typeStyles[type] || typeStyles.insight;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className={cn("rounded-xl border p-4 transition-all duration-200 hover:border-opacity-50", style.bg)}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("w-1.5 h-1.5 rounded-full", style.color.replace("text-", "bg-"))} />
        <span className={cn("text-[10px] uppercase tracking-[0.15em] font-medium", style.color)}>
          {style.label}
        </span>
      </div>
      {title && <h4 className="text-sm font-medium text-foreground mb-1">{title}</h4>}
      <p className="text-sm text-foreground/80 leading-relaxed">{content}</p>
      {subtitle && <p className="text-xs text-muted-foreground mt-2 italic">{subtitle}</p>}
    </motion.div>
  );
}