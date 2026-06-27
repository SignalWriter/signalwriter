import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Layers, Plus, Upload, Loader2, X, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const ARTIFACT_TYPES = ["Character", "Location", "Worldbuilding", "Symbol / Glyph", "Diagram", "Research", "Screenshot", "Mood / Inspiration", "Story Artifact", "Concept Art", "Project Asset", "Other"];

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

function QuickUploadForm({ extractionId, onSaved, onCancel }) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setImageUrl(file_url);
    setUploading(false);
  };

  const toggleType = (t) => setSelectedTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const artifact = await base44.entities.Artifact.create({
      title: title.trim(),
      image_url: imageUrl,
      artifact_types: selectedTypes,
      related_extraction_ids: [extractionId],
      status: "active",
    });
    setSaving(false);
    onSaved(artifact);
  };

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-xl border border-primary/20 bg-card/60 space-y-3">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {preview ? (
        <div className="relative rounded-lg overflow-hidden bg-muted/30 cursor-pointer group max-h-32" onClick={() => fileRef.current.click()}>
          <img src={preview} alt="preview" className="w-full object-contain max-h-32" />
          {uploading && <div className="absolute inset-0 bg-background/60 flex items-center justify-center"><Loader2 className="w-5 h-5 text-primary animate-spin" /></div>}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <p className="text-xs text-white">Change image</p>
          </div>
        </div>
      ) : (
        <button onClick={() => fileRef.current.click()} className="w-full py-6 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/40 transition-colors flex flex-col items-center gap-1.5 text-muted-foreground hover:text-foreground">
          <Upload className="w-5 h-5" />
          <p className="text-xs font-medium">Upload image</p>
        </button>
      )}

      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Artifact title *" className="bg-background/50" autoFocus />

      <div className="flex flex-wrap gap-1.5">
        {ARTIFACT_TYPES.map(t => (
          <button key={t} onClick={() => toggleType(t)} className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${selectedTypes.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-border/70"}`}>{t}</button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button size="sm" onClick={handleSave} disabled={!title.trim() || saving || uploading} className="h-7 text-xs gap-1">
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />} Save Artifact
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel} className="h-7 text-xs text-muted-foreground">Cancel</Button>
      </div>
    </motion.div>
  );
}

export default function ExtractionArtifacts({ extraction }) {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: artifacts = [] } = useQuery({
    queryKey: ["artifacts-for-extraction", extraction.id],
    queryFn: async () => {
      const all = await base44.entities.Artifact.filter({ status: "active" });
      return all.filter(a => (a.related_extraction_ids || []).includes(extraction.id));
    },
    enabled: !!extraction.id,
  });

  const handleSaved = () => {
    queryClient.invalidateQueries({ queryKey: ["artifacts-for-extraction", extraction.id] });
    setShowForm(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
          <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">Artifacts</span>
          {artifacts.length > 0 && <span className="text-[10px] text-muted-foreground/40">{artifacts.length}</span>}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(s => !s)} className="gap-1.5 text-xs text-muted-foreground h-7">
          <Plus className="w-3.5 h-3.5" /> Add Artifact
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <QuickUploadForm extractionId={extraction.id} onSaved={handleSaved} onCancel={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      {artifacts.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {artifacts.map((artifact, i) => (
            <motion.div key={artifact.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
              <Link to={`/artifact/${artifact.id}`} className="group block rounded-xl overflow-hidden border border-border/40 bg-card/50 hover:border-primary/30 transition-all">
                <div className="aspect-square bg-muted/30 overflow-hidden">
                  {artifact.image_url
                    ? <img src={artifact.image_url} alt={artifact.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    : <div className="w-full h-full flex items-center justify-center"><Layers className="w-6 h-6 text-muted-foreground/20" /></div>
                  }
                </div>
                <div className="p-2">
                  <p className="text-xs font-medium text-foreground truncate">{artifact.title}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(artifact.artifact_types || []).slice(0, 1).map(t => (
                      <span key={t} className={`text-[9px] px-1.5 py-0.5 rounded-full ${TYPE_COLORS[t] || TYPE_COLORS.Other}`}>{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {artifacts.length === 0 && !showForm && (
        <p className="text-xs text-muted-foreground/40 italic">No artifacts linked to this extraction yet.</p>
      )}
    </div>
  );
}