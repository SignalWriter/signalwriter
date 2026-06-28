import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { BookMarked, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";
import EvolutionNode from "@/components/canon/EvolutionNode";

const STATUS_COLORS = {
  active: "bg-emerald-400/10 text-emerald-400",
  dormant: "bg-amber-400/10 text-amber-400",
  completed: "bg-blue-400/10 text-blue-400",
  archived: "bg-muted text-muted-foreground",
};

export default function CanonEvolution() {
  const [expandedProject, setExpandedProject] = useState(null);

  const { data: projects = [], isLoading: loadingProjects } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: allUpdates = [], isLoading: loadingUpdates } = useQuery({
    queryKey: ["canon-updates-all"],
    queryFn: () => base44.entities.CanonUpdate.list("-created_date", 200),
  });

  const activeProjects = projects.filter(p => p.status !== "archived");

  const updatesByProject = allUpdates.reduce((acc, u) => {
    if (!acc[u.project_id]) acc[u.project_id] = [];
    acc[u.project_id].push(u);
    return acc;
  }, {});

  const isLoading = loadingProjects || loadingUpdates;

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Canon Evolution</h1>
        <p className="text-sm text-muted-foreground">How the core understanding of each project has changed over time.</p>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : activeProjects.length === 0 ? (
        <EmptyState icon={BookMarked} title="No active projects" description="Create a project and run Canon Updates to see how your understanding evolves over time." />
      ) : (
        <div className="space-y-4">
          {activeProjects.map((project, pi) => {
            const updates = (updatesByProject[project.id] || []).slice().sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
            const isExpanded = expandedProject === project.id;
            const updateCount = updates.length;

            return (
              <motion.div key={project.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: pi * 0.06 }}
                className="rounded-2xl border border-border/40 bg-card/40 overflow-hidden">

                {/* Project Header */}
                <button
                  onClick={() => setExpandedProject(isExpanded ? null : project.id)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 hover:bg-muted/20 transition-colors text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <BookMarked className="w-4 h-4 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="font-display text-xl text-foreground">{project.title}</h2>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_COLORS[project.status] || STATUS_COLORS.active}`}>{project.status}</span>
                      </div>
                      {project.description && <p className="text-xs text-muted-foreground mt-0.5 truncate">{project.description}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground/50">{updateCount} update{updateCount !== 1 ? "s" : ""}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground/50" /> : <ChevronDown className="w-4 h-4 text-muted-foreground/50" />}
                  </div>
                </button>

                {/* Timeline */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/30 px-6 py-6">
                        {updateCount === 0 ? (
                          <p className="text-xs text-muted-foreground/40 italic py-4 text-center">No canon updates yet. <Link to={`/canon-update/${project.id}`} className="text-primary underline">Run the first one.</Link></p>
                        ) : (
                          <div className="relative">
                            {/* Spine */}
                            <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border/40" />

                            <div className="space-y-0">
                              {updates.map((update, idx) => (
                                <EvolutionNode
                                  key={update.id}
                                  update={update}
                                  index={idx}
                                  total={updates.length}
                                  prevUpdate={idx > 0 ? updates[idx - 1] : null}
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Current Canon State */}
                        {project.canon_summary && (
                          <div className="mt-6 pt-5 border-t border-border/20">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                              <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-primary/70">Current Canon State</span>
                            </div>
                            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                              <p className="text-sm text-foreground/80 leading-relaxed line-clamp-4">{project.canon_summary}</p>
                            </div>
                            <div className="flex justify-end mt-2">
                              <Link to={`/project/${project.id}`} className="text-xs text-primary/60 hover:text-primary transition-colors">View full project →</Link>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}