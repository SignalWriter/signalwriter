import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Rocket, Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROJECT_TYPES = ["Product", "Story", "Book", "Essay", "Course", "Business", "Framework", "Community", "Other"];

const typeBadgeColors = {
  Product: "bg-green-400/10 text-green-400",
  Story: "bg-purple-400/10 text-purple-400",
  Book: "bg-amber-400/10 text-amber-400",
  Essay: "bg-blue-400/10 text-blue-400",
  Course: "bg-cyan-400/10 text-cyan-400",
  Business: "bg-orange-400/10 text-orange-400",
  Framework: "bg-indigo-400/10 text-indigo-400",
  Community: "bg-pink-400/10 text-pink-400",
  Other: "bg-muted text-muted-foreground",
};

export default function ExtractionInfluencedProjects({ extraction }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState("Product");
  const [notes, setNotes] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (projects) => base44.entities.Extraction.update(extraction.id, { influenced_projects: projects }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["extraction", extraction.id] }),
  });

  const projects = extraction.influenced_projects || [];

  const resetForm = () => {
    setName(""); setProjectType("Product"); setNotes("");
    setShowForm(false); setEditingId(null);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const entry = { id: editingId || crypto.randomUUID(), name: name.trim(), project_type: projectType, notes: notes.trim() };
    const updated = editingId ? projects.map(p => p.id === editingId ? entry : p) : [...projects, entry];
    mutation.mutate(updated);
    resetForm();
  };

  const handleEdit = (proj) => {
    setEditingId(proj.id); setName(proj.name); setProjectType(proj.project_type || "Other"); setNotes(proj.notes || "");
    setShowForm(true);
  };

  const handleRemove = (id) => mutation.mutate(projects.filter(p => p.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-foreground flex items-center gap-2">
          <Rocket className="w-4 h-4 text-primary" />
          Influenced Projects
          {projects.length > 0 && <span className="text-xs text-muted-foreground font-body">({projects.length})</span>}
        </h3>
        {!showForm && (
          <Button variant="ghost" size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1.5 text-xs text-muted-foreground">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 p-4 rounded-xl border border-border/40 bg-card/50 space-y-3">
            <Input placeholder="Project Name" value={name} onChange={e => setName(e.target.value)} className="bg-background/50 h-9 text-sm" />
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="bg-background/50 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PROJECT_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} className="bg-background/50 text-sm min-h-[60px]" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-3.5 h-3.5 mr-1" />Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!name.trim()} className="gap-1.5">
                <Check className="w-3.5 h-3.5" />{editingId ? "Update" : "Add"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {projects.length > 0 ? (
        <div className="space-y-2">
          {projects.map(proj => (
            <motion.div key={proj.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-card transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground mb-1">{proj.name}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeBadgeColors[proj.project_type] || typeBadgeColors.Other}`}>{proj.project_type || "Other"}</span>
                    {proj.notes && <p className="text-xs text-muted-foreground truncate">{proj.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => handleEdit(proj)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => handleRemove(proj.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : !showForm && (
        <p className="text-xs text-muted-foreground/60 italic">No influenced projects yet. Track what this extraction eventually became.</p>
      )}
    </div>
  );
}