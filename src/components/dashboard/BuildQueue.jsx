import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, ArrowRight, X, Calendar, Hash } from "lucide-react";
import { Link } from "react-router-dom";
import { format, differenceInDays } from "date-fns";

// Cluster extractions into project-like "build items" by scanning tags, patterns, project_implications
function buildQueueItems(extractions) {
  const projectMap = {};

  extractions.forEach(e => {
    const candidates = new Set();

    // From project_implications domain/idea fields
    (e.project_implications || []).forEach(pi => {
      if (pi.idea) candidates.add(pi.idea.split(" ").slice(0, 5).join(" "));
      if (pi.domain) candidates.add(pi.domain);
    });

    // From suggested_tags that look like project names (capitalized multi-word)
    (e.suggested_tags || []).forEach(tag => {
      if (/^[A-Z]/.test(tag) && tag.split(" ").length >= 2) candidates.add(tag);
    });

    // From framework_seeds names
    (e.framework_seeds || []).forEach(f => {
      if (f.name) candidates.add(f.name);
    });

    // From story_seeds (book/story projects)
    (e.story_seeds || []).forEach(s => {
      if (s.premise) {
        const words = s.premise.split(" ").slice(0, 5).join(" ");
        if (words.length > 10) candidates.add(words);
      }
    });

    candidates.forEach(name => {
      const key = name.toLowerCase().trim();
      if (!projectMap[key]) {
        projectMap[key] = {
          name,
          signalCount: 0,
          extractionIds: [],
          themes: new Set(),
          tags: new Set(),
          lastDate: null,
        };
      }
      projectMap[key].signalCount++;
      projectMap[key].extractionIds.push(e.id);
      (e.emerging_patterns || []).forEach(p => projectMap[key].themes.add(p));
      (e.suggested_tags || []).forEach(t => projectMap[key].tags.add(t));
      const d = new Date(e.created_date);
      if (!projectMap[key].lastDate || d > projectMap[key].lastDate) {
        projectMap[key].lastDate = d;
      }
    });
  });

  return Object.values(projectMap)
    .filter(p => p.signalCount >= 2)
    .map(p => ({ ...p, themes: [...p.themes].slice(0, 4), tags: [...p.tags].slice(0, 4) }))
    .sort((a, b) => b.signalCount - a.signalCount)
    .slice(0, 8);
}

function ProjectDrawer({ project, extractions, onClose }) {
  const related = extractions.filter(e => project.extractionIds.includes(e.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-medium mb-0.5">Build Queue · Project View</p>
            <h3 className="font-display text-lg text-foreground">{project.name}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto space-y-5">
          {/* Stats */}
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Supporting Signals</p>
              <p className="text-2xl font-display text-primary">{project.signalCount}</p>
            </div>
            {project.lastDate && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Last Activity</p>
                <p className="text-sm text-foreground">{format(project.lastDate, "MMM d, yyyy")}</p>
              </div>
            )}
          </div>

          {/* Themes */}
          {project.themes.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Related Themes</p>
              <div className="flex flex-wrap gap-1.5">
                {project.themes.map(t => (
                  <span key={t} className="text-xs px-2.5 py-1 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-300">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Supporting Extractions */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Supporting Signals</p>
            <div className="space-y-2">
              {related.map(e => (
                <Link
                  key={e.id}
                  to={`/extraction/${e.id}`}
                  onClick={onClose}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/30 bg-muted/20 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors truncate">{e.title}</p>
                    {e.core_insight && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.core_insight}</p>
                    )}
                    <p className="text-[10px] text-muted-foreground/50 mt-1">{format(new Date(e.created_date), "MMM d, yyyy")}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function BuildQueue({ extractions }) {
  const [activeProject, setActiveProject] = useState(null);
  const items = useMemo(() => buildQueueItems(extractions), [extractions]);

  if (items.length === 0) return null;

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Flame className="w-4 h-4 text-primary" />
          <h2 className="font-display text-xl text-foreground">Build Queue</h2>
          <span className="text-[10px] text-muted-foreground/50 font-mono ml-1">What you're building</span>
        </div>

        <div className="space-y-2">
          {items.map((item, i) => {
            const daysSince = item.lastDate ? differenceInDays(new Date(), item.lastDate) : null;
            return (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveProject(item)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-primary/15 bg-primary/5 hover:border-primary/30 hover:bg-primary/8 transition-all group text-left"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Flame className="w-3.5 h-3.5 text-primary/60 flex-shrink-0" />
                  <span className="text-sm font-medium text-foreground truncate">{item.name}</span>
                  {item.themes.length > 0 && (
                    <span className="hidden sm:flex items-center gap-1 text-[10px] text-muted-foreground/50">
                      <Hash className="w-2.5 h-2.5" />
                      {item.themes[0]}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-2">
                  <span className="text-xs text-primary font-medium">{item.signalCount} signals</span>
                  {daysSince !== null && (
                    <span className="text-[10px] text-muted-foreground/50 hidden sm:flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {daysSince === 0 ? "today" : `${daysSince}d ago`}
                    </span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {activeProject && (
          <ProjectDrawer
            project={activeProject}
            extractions={extractions}
            onClose={() => setActiveProject(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}