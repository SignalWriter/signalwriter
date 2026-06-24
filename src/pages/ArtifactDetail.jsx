import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Check, X, Upload, Loader2, Trash2, Archive, Tag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { TYPE_COLORS } from "@/components/artifacts/ArtifactCard";
import ArtifactMiraInsights from "@/components/artifacts/ArtifactMiraInsights";
import ArtifactContinuity from "@/components/artifacts/ArtifactContinuity";
import ArtifactRelated from "@/components/artifacts/ArtifactRelated";
import { Layers } from "lucide-react";

const ARTIFACT_TYPES = ["Character", "Location", "Worldbuilding", "Symbol / Glyph", "Diagram", "Research", "Screenshot", "Mood / Inspiration", "Story Artifact", "Concept Art", "Project Asset", "Other"];

function EditableField({ value, onSave, multiline = false, placeholder = "" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");

  const handleSave = () => { onSave(draft); setEditing(false); };
  const handleCancel = () => { setDraft(value || ""); setEditing(false); };

  if (editing) {
    return (
      <div className="space-y-2">
        {multiline ? (
          <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="bg-muted/30 text-sm min-h-[80px]" autoFocus />
        ) : (
          <Input value={draft} onChange={e => setDraft(e.target.value)} className="bg-muted/30" autoFocus onKeyDown={e => e.key === "Enter" && handleSave()} />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} className="h-7 text-xs px-3 gap-1"><Check className="w-3 h-3" />Save</Button>
          <Button size="sm" variant="ghost" onClick={handleCancel} className="h-7 text-xs px-3 text-muted-foreground">Cancel</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="group flex items-start gap-2 cursor-pointer" onClick={() => setEditing(true)}>
      <span className={value ? "" : "text-muted-foreground/40 italic"}>{value || placeholder}</span>
      <Pencil className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-0.5 flex-shrink-0" />
    </div>
  );
}

export default function ArtifactDetail() {
  const id = window.location.pathname.split("/").pop();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [editingTypes, setEditingTypes] = useState(false);
  const [draftTypes, setDraftTypes] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [editingTags, setEditingTags] = useState(false);

  const { data: artifact, isLoading } = useQuery({
    queryKey: ["artifact", id],
    queryFn: async () => {
      const list = await base44.entities.Artifact.filter({ id });
      return list[0];
    },
    enabled: !!id,
  });

  const { data: linkedExtractions = [] } = useQuery({
    queryKey: ["linked-extractions", id],
    queryFn: async () => {
      if (!artifact?.related_extraction_ids?.length) return [];
      const all = await base44.entities.Extraction.list();
      return all.filter(e => artifact.related_extraction_ids.includes(e.id));
    },
    enabled: !!artifact,
  });

  const { data: linkedPenfires = [] } = useQuery({
    queryKey: ["linked-penfires", id],
    queryFn: async () => {
      if (!artifact?.related_penfire_ids?.length) return [];
      const all = await base44.entities.Penfire.list();
      return all.filter(p => artifact.related_penfire_ids.includes(p.id));
    },
    enabled: !!artifact,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.Artifact.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["artifact", id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Artifact.delete(id),
    onSuccess: () => navigate("/artifacts"),
  });

  const archiveMutation = useMutation({
    mutationFn: () => base44.entities.Artifact.update(id, { status: "archived" }),
    onSuccess: () => navigate("/artifacts"),
  });

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updateMutation.mutate({ image_url: file_url });
    setUploading(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!artifact) {
    return <div className="max-w-3xl mx-auto px-6 py-12 text-center"><p className="text-muted-foreground">Artifact not found.</p><Link to="/artifacts" className="text-primary text-sm mt-2 inline-block">← Back to Archive</Link></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      {/* Nav */}
      <div className="flex items-center justify-between mb-8">
        <Link to="/artifacts" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Archive
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => archiveMutation.mutate()} className="gap-1.5 text-xs text-muted-foreground h-7">
            <Archive className="w-3.5 h-3.5" /> Archive
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this artifact?")) deleteMutation.mutate(); }} className="gap-1.5 text-xs text-destructive/70 hover:text-destructive h-7">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Image */}
        <div className="relative group rounded-2xl overflow-hidden bg-muted/20 border border-border/40">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          {artifact.image_url ? (
            <img src={artifact.image_url} alt={artifact.title} className="w-full max-h-[480px] object-contain" />
          ) : (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground/40">
              <Layers className="w-12 h-12" />
              <p className="text-sm">No image</p>
            </div>
          )}
          <button onClick={() => fileRef.current.click()} className="absolute bottom-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border/40 text-xs text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {artifact.image_url ? "Change" : "Upload"}
          </button>
        </div>

        {/* Title */}
        <div>
          <div className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-1">
            {artifact.created_date && format(new Date(artifact.created_date), "MMMM d, yyyy")}
          </div>
          <div className="font-display text-3xl text-foreground">
            <EditableField value={artifact.title} onSave={v => updateMutation.mutate({ title: v })} placeholder="Untitled Artifact" />
          </div>
        </div>

        {/* Types */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Artifact Types</p>
          {editingTypes ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {ARTIFACT_TYPES.map(t => (
                  <button key={t} onClick={() => setDraftTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${draftTypes.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-border/70"}`}>{t}</button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => { updateMutation.mutate({ artifact_types: draftTypes }); setEditingTypes(false); }} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingTypes(false)} className="h-7 text-xs text-muted-foreground">Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-1.5 cursor-pointer group" onClick={() => { setDraftTypes(artifact.artifact_types || []); setEditingTypes(true); }}>
              {(artifact.artifact_types || []).map(t => (
                <span key={t} className={`text-xs px-2.5 py-1 rounded-full ${TYPE_COLORS[t] || TYPE_COLORS.Other}`}>{t}</span>
              ))}
              <span className="text-xs px-2.5 py-1 rounded-full border border-dashed border-border/40 text-muted-foreground/50 group-hover:border-border/70 group-hover:text-muted-foreground transition-colors">
                <Pencil className="w-3 h-3 inline" /> Edit
              </span>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Description</p>
          <div className="text-sm text-foreground/85 leading-relaxed">
            <EditableField value={artifact.description} onSave={v => updateMutation.mutate({ description: v })} multiline placeholder="What is this artifact? Click to describe it..." />
          </div>
        </div>

        {/* Notes */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Notes</p>
          <div className="text-sm text-foreground/85 leading-relaxed">
            <EditableField value={artifact.notes} onSave={v => updateMutation.mutate({ notes: v })} multiline placeholder="Personal notes — connections, intentions, observations..." />
          </div>
        </div>

        {/* Tags */}
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Tags
          </p>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(artifact.tags || []).map((tag, i) => (
              <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted/40 border border-border/30 text-foreground/70">
                {tag}
                <button onClick={() => updateMutation.mutate({ tags: (artifact.tags || []).filter((_, j) => j !== i) })} className="text-muted-foreground/50 hover:text-destructive ml-0.5"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
          {editingTags ? (
            <div className="flex gap-2">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..." className="h-8 text-xs bg-background/50" onKeyDown={e => { if (e.key === "Enter" && tagInput.trim()) { updateMutation.mutate({ tags: [...(artifact.tags || []), tagInput.trim()] }); setTagInput(""); setEditingTags(false); }}} />
              <Button size="sm" onClick={() => { if (tagInput.trim()) { updateMutation.mutate({ tags: [...(artifact.tags || []), tagInput.trim()] }); setTagInput(""); } setEditingTags(false); }} className="h-8 px-2"><Check className="w-3.5 h-3.5" /></Button>
            </div>
          ) : (
            <button onClick={() => setEditingTags(true)} className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3" /> Add tag
            </button>
          )}
        </div>

        <div className="border-t border-border/30 pt-8 space-y-10">
          <ArtifactMiraInsights artifact={artifact} linkedExtractions={linkedExtractions} linkedPenfires={linkedPenfires} />
          <ArtifactContinuity artifact={artifact} />
          <ArtifactRelated artifact={artifact} />
        </div>
      </motion.div>
    </div>
  );
}