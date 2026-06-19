import { format } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function SignalTimeline({ extractions }) {
  if (!extractions?.length) return null;

  const sorted = [...extractions].sort(
    (a, b) => new Date(a.created_date) - new Date(b.created_date)
  );

  return (
    <div className="space-y-0">
      {sorted.map((e, i) => (
        <motion.div
          key={e.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex gap-4 group"
        >
          <div className="flex flex-col items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/60 border-2 border-primary/30 mt-1.5 flex-shrink-0" />
            {i < sorted.length - 1 && <div className="w-px flex-1 bg-border/50" />}
          </div>
          <Link to={`/extraction/${e.id}`} className="pb-5 flex-1 min-w-0 group/link">
            <p className="text-[11px] text-muted-foreground mb-0.5">
              {format(new Date(e.created_date), "MMM d, yyyy")}
            </p>
            <p className="text-sm text-foreground group-hover/link:text-primary transition-colors truncate">
              {e.title}
            </p>
            {e.core_insight && (
              <p className="text-xs text-muted-foreground/70 line-clamp-1 mt-0.5">{e.core_insight}</p>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  );
}