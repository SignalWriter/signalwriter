import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, BookMarked, Plus, ChevronDown, ChevronUp, Pencil, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { CanonEntryCard, CanonSectionHeader } from "@/components/canon/CanonSection";

const STATUS_OPTIONS = ["active", "dormant", "completed", "archived"];
const CATEGORY_OPTIONS = ["Character", "Concept", "Terminology", "Location", "System", "Relationship", "Rule", "Theme", "Framework", "Other"];
const CONFIDENCE_OPTIONS = ["High", "Medium", "Low"];

function generateId() { return Math.random().toString(36).slice(2, 10); }

function AddCanonEntryForm({ onSave, onCancel }) {
  const [category, setCategory] = useState("Concept");
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [confidence, setConfidence] = useState("Medium");
  return (
    <div className="p-4 rounded-xl border border-primary/20 bg-card/60 space-y-3">
      <div className="flex gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-40 bg-background/50 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{CATEGORY_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={confidence} onValueChange={setConfidence}>
          <SelectTrigger className="w-28 bg-background/50 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>{CONFIDENCE_OPTIONS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
        </Select>
      </div>
      <Input value={name} onChange={e => setName(e.target.value)} placeholder="Entry name *" className="bg-background/50" autoFocus />
      <Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Canonical description" className="bg-background/50 min-h-[60px]" />
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave({ id: generateId(), category, name, description: desc, confidence, created_at: new Date().toISOString() })} disabled={!name.trim()} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Add</Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 text-xs text-muted-foreground">Cancel</Button>
      </div>
    </div>
  );
}

export default function ProjectDetail() {
  const id = window.location.pathname.split("/").pop();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState("");
  const [showAllEntries, setShowAllEntries] = useState(false);
  const [newThread, setNewThread] = useState("");

  const { data: project, isLoading } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => { const list = await base44.entities.Project.filter({ id }); return list[0]; },
    enabled: !!id,
  });

  const { data: canonUpdates = [] } = useQuery({
    queryKey: ["canon-updates", id],
    queryFn: () => base44.entities.CanonUpdate.filter({ project_id: id }, "-created_date"),
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Project.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["project", id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Project.delete(id),
    onSuccess: () => navigate("/projects"),
  });

  const saveField = (field, value) => { updateMutation.mutate({ [field]: value }); setEditingField(null); };

  const addCanonEntry = (entry) => {
    updateMutation.mutate({ canon_entries: [...(project.canon_entries || []), entry] });
    setShowAddEntry(false);
  };

  const removeEntry = (entryId) => updateMutation.mutate({ canon_entries: (project.canon_entries || []).filter(e => e.id !== entryId) });

  const addThread = () => {
    if (!newThread.trim()) return;
    const thread = { id: generateId(), content: newThread.trim(), created_at: new Date().toISOString() };
    updateMutation.mutate({ open_threads: [...(project.open_threads || []), thread] });
    setNewThread("");
  };

  const removeThread = (threadId) => updateMutation.mutate({ open_threads: (project.open_threads || []).filter(t => t.id !== threadId) });

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!project) return <div className="max-w-3xl mx-auto px-6 py-12 text-center"><p className="text-muted-foreground">Project not found.</p><Link to="/projects" className="text-primary text-sm mt-2 inline-block">← Back to Projects</Link></div>;

  const entries = project.canon_entries || [];
  const displayedEntries = showAllEntries ? entries : entries.slice(0, 6);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <Link to="/projects" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="flex items-center gap-2">
          <Select value={project.status} onValueChange={v => updateMutation.mutate({ status: v })}>
            <SelectTrigger className="w-32 h-8 text-xs bg-card/50"><SelectValue /></SelectTrigger>
            <SelectContent>{STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
          </Select>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this project?")) deleteMutation.mutate(); }} className="h-8 text-xs text-destructive/60 hover:text-destructive gap-1.5">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Title */}
        <div>
          {editingField === "title" ? (
            <div className="space-y-2">
              <Input value={draft} onChange={e => setDraft(e.target.value)} className="font-display text-2xl bg-muted/30" autoFocus onKeyDown={e => e.key === "Enter" && saveField("title", draft)} />
              <div className="flex gap-2"><Button size="sm" onClick={() => saveField("title", draft)} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingField(null)} className="h-7 text-xs text-muted-foreground">Cancel</Button></div>
            </div>
          ) : (
            <div className="group flex items-start gap-2 cursor-pointer" onClick={() => { setEditingField("title"); setDraft(project.title); }}>
              <h1 className="font-display text-3xl text-foreground">{project.title}</h1>
              <Pencil className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-2" />
            </div>
          )}
          {editingField === "description" ? (
            <div className="space-y-2 mt-3">
              <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="bg-muted/30 text-sm" autoFocus />
              <div className="flex gap-2"><Button size="sm" onClick={() => saveField("description", draft)} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingField(null)} className="h-7 text-xs text-muted-foreground">Cancel</Button></div>
            </div>
          ) : (
            <div className="group flex items-start gap-2 cursor-pointer mt-2" onClick={() => { setEditingField("description"); setDraft(project.description || ""); }}>
              <p className="text-sm text-muted-foreground">{project.description || <span className="italic text-muted-foreground/40">Add a project description...</span>}</p>
              <Pencil className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-0.5" />
            </div>
          )}
        </div>

        {/* Canon Summary */}
        <div>
          <CanonSectionHeader label="Current Canon Summary" />
          {editingField === "canon_summary" ? (
            <div className="space-y-2">
              <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="bg-muted/30 text-sm min-h-[120px]" autoFocus />
              <div className="flex gap-2"><Button size="sm" onClick={() => saveField("canon_summary", draft)} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingField(null)} className="h-7 text-xs text-muted-foreground">Cancel</Button></div>
            </div>
          ) : (
            <div className="group cursor-pointer" onClick={() => { setEditingField("canon_summary"); setDraft(project.canon_summary || ""); }}>
              {project.canon_summary ? (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 hover:border-primary/20 transition-colors">
                  <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{project.canon_summary}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border/40 hover:border-border/60 transition-colors">
                  <p className="text-xs text-muted-foreground/40 italic">No canon summary yet. Run a Canon Update to generate one, or click to write one manually.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Canon Entries */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <CanonSectionHeader label="Canon Entries" count={entries.length} />
            <Button variant="ghost" size="sm" onClick={() => setShowAddEntry(s => !s)} className="gap-1.5 text-xs text-muted-foreground h-7">
              <Plus className="w-3.5 h-3.5" /> Add Entry
            </Button>
          </div>
          <AnimatePresence>
            {showAddEntry && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-3">
                <AddCanonEntryForm onSave={addCanonEntry} onCancel={() => setShowAddEntry(false)} />
              </motion.div>
            )}
          </AnimatePresence>
          {entries.length === 0 ? (
            <p className="text-xs text-muted-foreground/40 italic">No canon entries yet. Run a Canon Update or add one manually.</p>
          ) : (
            <div className="space-y-2">
              {displayedEntries.map((entry, i) => (
                <div key={entry.id} className="relative group">
                  <CanonEntryCard entry={entry} index={i} />
                  <button onClick={() => removeEntry(entry.id)} className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {entries.length > 6 && (
                <Button variant="ghost" size="sm" onClick={() => setShowAllEntries(s => !s)} className="w-full text-xs text-muted-foreground gap-1.5 h-8">
                  {showAllEntries ? <><ChevronUp className="w-3.5 h-3.5" />Show less</> : <><ChevronDown className="w-3.5 h-3.5" />Show {entries.length - 6} more</>}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Open Threads */}
        <div>
          <CanonSectionHeader label="Open Threads" count={(project.open_threads || []).length} />
          <div className="space-y-2">
            {(project.open_threads || []).map((thread) => (
              <div key={thread.id} className="group flex items-start gap-2 p-3 rounded-lg bg-muted/20 border border-border/20 hover:border-border/40 transition-colors">
                <span className="text-primary mt-0.5 flex-shrink-0 text-xs">◆</span>
                <p className="text-sm text-foreground/80 flex-1 leading-relaxed">{thread.content}</p>
                <button onClick={() => removeThread(thread.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive flex-shrink-0">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input value={newThread} onChange={e => setNewThread(e.target.value)} placeholder="Add an open thread..." className="h-8 text-xs bg-background/50" onKeyDown={e => e.key === "Enter" && addThread()} />
              <Button size="sm" onClick={addThread} disabled={!newThread.trim()} variant="ghost" className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button>
            </div>
          </div>
        </div>

        {/* Suggested Queries */}
        {(project.suggested_canon_queries || []).length > 0 && (
          <div>
            <CanonSectionHeader label="Suggested Canon Queries" />
            <div className="space-y-1.5">
              {project.suggested_canon_queries.map((q, i) => (
                <div key={i} className="text-sm text-muted-foreground italic px-3 py-1.5 rounded-lg bg-muted/10 border border-border/20">{q}</div>
              ))}
            </div>
          </div>
        )}

        {/* Canon Update History */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <CanonSectionHeader label="Canon Update History" count={canonUpdates.length} />
            <Link to={`/canon-update/${id}`}>
              <Button size="sm" className="gap-1.5 text-xs h-7">
                <BookMarked className="w-3.5 h-3.5" /> New Canon Update
              </Button>
            </Link>
          </div>
          {canonUpdates.length === 0 ? (
            <p className="text-xs text-muted-foreground/40 italic">No canon updates yet. Paste a conversation to update the living canon.</p>
          ) : (
            <div className="space-y-2">
              {canonUpdates.map((update) => (
                <Link key={update.id} to={`/canon-result/${update.id}`} className="block p-4 rounded-xl border border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card transition-all group">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground/85 line-clamp-2 leading-relaxed">{update.canon_changes || update.source_text?.slice(0, 120) + "..."}</p>
                      {(update.new_canon_entries || []).length > 0 && (
                        <p className="text-[10px] text-muted-foreground/50 mt-1">+{update.new_canon_entries.length} new canon entries</p>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground/40 flex-shrink-0">{update.created_date && format(new Date(update.created_date), "MMM d, yyyy")}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}