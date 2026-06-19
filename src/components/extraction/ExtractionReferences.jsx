import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LinkIcon, Plus, Trash2, ExternalLink, Pencil, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RESOURCE_TYPES = ["Article", "Video", "Book", "Podcast", "Website", "PDF / Document", "Tool / App", "Research", "Other"];

const typeBadgeColors = {
  Article: "bg-blue-400/10 text-blue-400",
  Video: "bg-red-400/10 text-red-400",
  Book: "bg-amber-400/10 text-amber-400",
  Podcast: "bg-purple-400/10 text-purple-400",
  Website: "bg-cyan-400/10 text-cyan-400",
  "PDF / Document": "bg-orange-400/10 text-orange-400",
  "Tool / App": "bg-green-400/10 text-green-400",
  Research: "bg-indigo-400/10 text-indigo-400",
  Other: "bg-muted text-muted-foreground",
};

export default function ExtractionReferences({ extraction }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [resourceType, setResourceType] = useState("Article");
  const [description, setDescription] = useState("");
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (refs) => base44.entities.Extraction.update(extraction.id, { references: refs }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["extraction", extraction.id] }),
  });

  const references = extraction.references || [];

  const resetForm = () => {
    setTitle(""); setUrl(""); setResourceType("Article"); setDescription("");
    setShowForm(false); setEditingId(null);
  };

  const handleSave = () => {
    if (!title.trim() || !url.trim()) return;
    const entry = { id: editingId || crypto.randomUUID(), title: title.trim(), url: url.trim(), resource_type: resourceType, description: description.trim() };
    const updated = editingId ? references.map(r => r.id === editingId ? entry : r) : [...references, entry];
    mutation.mutate(updated);
    resetForm();
  };

  const handleEdit = (ref) => {
    setEditingId(ref.id); setTitle(ref.title); setUrl(ref.url);
    setResourceType(ref.resource_type || "Other"); setDescription(ref.description || "");
    setShowForm(true);
  };

  const handleRemove = (id) => mutation.mutate(references.filter(r => r.id !== id));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-foreground flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-primary" />
          References
          {references.length > 0 && <span className="text-xs text-muted-foreground font-body">({references.length})</span>}
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
            <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} className="bg-background/50 h-9 text-sm" />
            <Input placeholder="URL" value={url} onChange={e => setUrl(e.target.value)} className="bg-background/50 h-9 text-sm" />
            <Select value={resourceType} onValueChange={setResourceType}>
              <SelectTrigger className="bg-background/50 h-9 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {RESOURCE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} className="bg-background/50 text-sm min-h-[60px]" />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={resetForm}><X className="w-3.5 h-3.5 mr-1" />Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={!title.trim() || !url.trim()} className="gap-1.5">
                <Check className="w-3.5 h-3.5" />{editingId ? "Update" : "Add"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {references.length > 0 ? (
        <div className="space-y-2">
          {references.map(ref => (
            <motion.div key={ref.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="group p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-card transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-foreground hover:text-primary transition-colors truncate flex items-center gap-1.5">
                      {ref.title}
                      <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-50" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${typeBadgeColors[ref.resource_type] || typeBadgeColors.Other}`}>{ref.resource_type || "Other"}</span>
                    {ref.description && <p className="text-xs text-muted-foreground truncate">{ref.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => handleEdit(ref)} className="p-1 text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3" /></button>
                  <button onClick={() => handleRemove(ref.id)} className="p-1 text-muted-foreground hover:text-destructive"><Trash2 className="w-3 h-3" /></button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : !showForm && (
        <p className="text-xs text-muted-foreground/60 italic">No references yet. Add articles, books, or resources that informed this extraction.</p>
      )}
    </div>
  );
}