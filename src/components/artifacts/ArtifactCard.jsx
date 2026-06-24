import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import { format } from "date-fns";

const TYPE_COLORS = {
  "Character": "bg-purple-400/10 text-purple-400",
  "Location": "bg-green-400/10 text-green-400",
  "Worldbuilding": "bg-blue-400/10 text-blue-400",
  "Symbol / Glyph": "bg-amber-400/10 text-amber-400",
  "Diagram": "bg-cyan-400/10 text-cyan-400",
  "Research": "bg-indigo-400/10 text-indigo-400",
  "Screenshot": "bg-slate-400/10 text-slate-400",
  "Mood / Inspiration": "bg-pink-400/10 text-pink-400",
  "Story Artifact": "bg-orange-400/10 text-orange-400",
  "Concept Art": "bg-rose-400/10 text-rose-400",
  "Project Asset": "bg-teal-400/10 text-teal-400",
  "Other": "bg-muted text-muted-foreground",
};

export { TYPE_COLORS };

export default function ArtifactCard({ artifact, index = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
      <Link to={`/artifact/${artifact.id}`} className="group block rounded-xl overflow-hidden border border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card transition-all duration-200">
        <div className="aspect-square overflow-hidden bg-muted/30 relative">
          {artifact.image_url ? (
            <img src={artifact.image_url} alt={artifact.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Layers className="w-8 h-8 text-muted-foreground/20" />
            </div>
          )}
        </div>
        <div className="p-3">
          <p className="text-sm font-medium text-foreground truncate mb-1.5">{artifact.title}</p>
          <div className="flex flex-wrap gap-1 mb-2">
            {(artifact.artifact_types || []).slice(0, 2).map(t => (
              <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded-full ${TYPE_COLORS[t] || TYPE_COLORS.Other}`}>{t}</span>
            ))}
            {(artifact.artifact_types || []).length > 2 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">+{artifact.artifact_types.length - 2}</span>
            )}
          </div>
          {artifact.created_date && (
            <p className="text-[10px] text-muted-foreground/40">{format(new Date(artifact.created_date), "MMM d, yyyy")}</p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}