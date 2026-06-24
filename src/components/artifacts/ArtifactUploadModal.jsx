import { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const ARTIFACT_TYPES = ["Character", "Location", "Worldbuilding", "Symbol / Glyph", "Diagram", "Research", "Screenshot", "Mood / Inspiration", "Story Artifact", "Concept Art", "Project Asset", "Other"];

export default function ArtifactUploadModal({ onClose, onSaved }) {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef();

  const handleFileSelect = async (e) => {
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
      description: description.trim(),
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      status: "active",
    });
    setSaving(false);
    onSaved(artifact);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="w-full max-w-lg bg-card border border-border/40 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border/30 flex-shrink-0">
          <h2 className="font-display text-xl text-foreground">Add Artifact</h2>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg transition-colors"><X className="w-4 h-4" /></button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Image Upload */}
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileSelect} />
            {preview ? (
              <div className="relative rounded-xl overflow-hidden bg-muted/30 cursor-pointer group max-h-48" onClick={() => fileRef.current.click()}>
                <img src={preview} alt="preview" className="w-full object-contain max-h-48" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-sm text-white font-medium">Change image</p>
                </div>
                {uploading && (
                  <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => fileRef.current.click()} className="w-full py-12 rounded-xl border-2 border-dashed border-border/50 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground">
                <Upload className="w-7 h-7" />
                <p className="text-sm font-medium">Upload image</p>
                <p className="text-xs opacity-50">PNG, JPG, GIF, WebP, SVG</p>
              </button>
            )}
          </div>

          <Input placeholder="Artifact title *" value={title} onChange={e => setTitle(e.target.value)} className="bg-background/50" />

          <div>
            <p className="text-xs text-muted-foreground mb-2">Artifact Types</p>
            <div className="flex flex-wrap gap-1.5">
              {ARTIFACT_TYPES.map(t => (
                <button key={t} onClick={() => toggleType(t)} className={`text-xs px-2.5 py-1 rounded-full border transition-all ${selectedTypes.includes(t) ? "border-primary bg-primary/10 text-primary" : "border-border/40 text-muted-foreground hover:border-border/70"}`}>{t}</button>
              ))}
            </div>
          </div>

          <Textarea placeholder="What is this artifact? What does it represent?" value={description} onChange={e => setDescription(e.target.value)} className="bg-background/50 min-h-[80px]" />
          <Input placeholder="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} className="bg-background/50" />
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-border/30 flex-shrink-0">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving || uploading} className="gap-2 min-w-[120px]">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Artifact
          </Button>
        </div>
      </motion.div>
    </div>
  );
}