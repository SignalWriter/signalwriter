import { motion } from "framer-motion";

const CONFIDENCE_STYLES = {
  High: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
  Medium: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  Low: "bg-slate-400/10 text-slate-400 border-slate-400/20",
};

const CATEGORY_STYLES = {
  Character: "text-purple-400",
  Concept: "text-blue-400",
  Terminology: "text-cyan-400",
  Location: "text-green-400",
  System: "text-indigo-400",
  Relationship: "text-pink-400",
  Rule: "text-orange-400",
  Theme: "text-amber-400",
  Framework: "text-teal-400",
  Other: "text-muted-foreground",
};

export function CanonEntryCard({ entry, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-1.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className={`text-[10px] uppercase tracking-[0.12em] font-medium ${CATEGORY_STYLES[entry.category] || CATEGORY_STYLES.Other}`}>
            {entry.category}
          </span>
          <h4 className="font-medium text-sm text-foreground mt-0.5">{entry.name}</h4>
        </div>
        {entry.confidence && (
          <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${CONFIDENCE_STYLES[entry.confidence] || CONFIDENCE_STYLES.Low}`}>
            {entry.confidence}
          </span>
        )}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{entry.description}</p>
    </motion.div>
  );
}

export function CanonSectionHeader({ label, count }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
      <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">{label}</span>
      {count != null && <span className="text-[10px] text-muted-foreground/40">{count}</span>}
    </div>
  );
}

export function CanonBlock({ label, content }) {
  if (!content) return null;
  return (
    <div className="space-y-2">
      <CanonSectionHeader label={label} />
      <div className="p-4 rounded-xl bg-muted/20 border border-border/20">
        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>
    </div>
  );
}

export function CanonListBlock({ label, items }) {
  if (!items?.length) return null;
  return (
    <div className="space-y-2">
      <CanonSectionHeader label={label} count={items.length} />
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
            <span className="text-primary mt-0.5 flex-shrink-0">◆</span>
            <span className="leading-relaxed">{typeof item === "string" ? item : item.content || item.name || JSON.stringify(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}