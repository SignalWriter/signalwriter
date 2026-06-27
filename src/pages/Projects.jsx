import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { BookMarked, Plus, ArrowRight, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";

const STATUS_STYLES = {
  active: "bg-emerald-400/10 text-emerald-400",
  dormant: "bg-amber-400/10 text-amber-400",
  completed: "bg-blue-400/10 text-blue-400",
  archived: "bg-muted text-muted-foreground",
};

function NewProjectForm({ onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="p-5 rounded-xl border border-primary/20 bg-card/60 space-y-4">
      <h3 className="font-display text-lg text-foreground">New Project</h3>
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Project title *" className="bg-background/50" autoFocus />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="What is this project about?" className="bg-background/50 min-h-[80px]" />
      <div className="flex gap-2">
        <Button onClick={() => onSave({ title, description })} disabled={!title.trim()} className="gap-2">
          <Plus className="w-4 h-4" /> Create Project
        </Button>
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">Cancel</Button>
      </div>
    </div>
  );
}

export default function Projects() {
  const [showNew, setShowNew] = useState(false);
  const queryClient = useQueryClient();

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const { data: canonUpdates = [] } = useQuery({
    queryKey: ["canon-updates-all"],
    queryFn: () => base44.entities.CanonUpdate.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.create({ ...data, status: "active" }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["projects"] }); setShowNew(false); },
  });

  const updatesByProject = canonUpdates.reduce((acc, u) => {
    acc[u.project_id] = (acc[u.project_id] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Projects</h1>
          <p className="text-sm text-muted-foreground">Living canons. Where discovery becomes continuity.</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> New Project
        </Button>
      </motion.div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
            <NewProjectForm onSave={(data) => createMutation.mutate(data)} onCancel={() => setShowNew(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={BookMarked}
          title="No projects yet"
          description="Create a project to give conversations a home. Each project maintains a living canon — updated with every new conversation."
          action={<Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="w-4 h-4" />Create First Project</Button>}
        />
      ) : (
        <div className="space-y-3">
          {projects.map((project, i) => (
            <motion.div key={project.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/project/${project.id}`} className="block p-5 rounded-xl border border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${STATUS_STYLES[project.status] || STATUS_STYLES.active}`}>{project.status}</span>
                      {updatesByProject[project.id] > 0 && (
                        <span className="text-[10px] text-muted-foreground/50">{updatesByProject[project.id]} canon update{updatesByProject[project.id] > 1 ? "s" : ""}</span>
                      )}
                    </div>
                    <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">{project.title}</h3>
                    {project.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{project.description}</p>}
                    {project.canon_summary && (
                      <p className="text-xs text-muted-foreground/60 mt-2 line-clamp-2 italic">{project.canon_summary}</p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
                <div className="mt-3 flex items-center gap-3">
                  {(project.canon_entries || []).length > 0 && (
                    <span className="text-[10px] text-muted-foreground/40">{project.canon_entries.length} canon entries</span>
                  )}
                  {(project.open_threads || []).length > 0 && (
                    <span className="text-[10px] text-muted-foreground/40">{project.open_threads.length} open threads</span>
                  )}
                  {project.created_date && (
                    <span className="text-[10px] text-muted-foreground/30">{format(new Date(project.created_date), "MMM d, yyyy")}</span>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}