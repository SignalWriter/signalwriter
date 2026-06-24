import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Layers, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import ArtifactCard from "@/components/artifacts/ArtifactCard";
import ArtifactUploadModal from "@/components/artifacts/ArtifactUploadModal";
import EmptyState from "@/components/shared/EmptyState";
import { AnimatePresence } from "framer-motion";

const ARTIFACT_TYPES = ["Character", "Location", "Worldbuilding", "Symbol / Glyph", "Diagram", "Research", "Screenshot", "Mood / Inspiration", "Story Artifact", "Concept Art", "Project Asset", "Other"];

export default function ArtifactArchive() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: artifacts = [], isLoading } = useQuery({
    queryKey: ["artifacts"],
    queryFn: () => base44.entities.Artifact.filter({ status: "active" }, "-created_date"),
  });

  const filtered = artifacts.filter(a => {
    const q = search.toLowerCase();
    const matchesSearch = !search ||
      a.title?.toLowerCase().includes(q) ||
      a.description?.toLowerCase().includes(q) ||
      (a.tags || []).some(t => t.toLowerCase().includes(q)) ||
      (a.artifact_types || []).some(t => t.toLowerCase().includes(q));
    const matchesType = !typeFilter || (a.artifact_types || []).includes(typeFilter);
    return matchesSearch && matchesType;
  });

  const handleSaved = (artifact) => {
    queryClient.invalidateQueries({ queryKey: ["artifacts"] });
    setShowUpload(false);
    if (artifact?.id) navigate(`/artifact/${artifact.id}`);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Artifact Archive</h1>
          <p className="text-sm text-muted-foreground">Preserve what images meant when they emerged.</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> Add Artifact
        </Button>
      </motion.div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title, tag, type, or keyword..." className="pl-9" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="h-9 px-3 rounded-md border border-input bg-card text-sm text-foreground min-w-[160px]">
          <option value="">All Types</option>
          {ARTIFACT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={artifacts.length === 0 ? "Your artifact archive is empty" : "No artifacts match your search"}
          description={artifacts.length === 0
            ? "Add your first artifact — an image, glyph, symbol, diagram, or piece of concept art — and preserve what it meant when it emerged."
            : "Try adjusting your search or filters."}
          action={artifacts.length === 0 ? (
            <Button onClick={() => setShowUpload(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Add First Artifact
            </Button>
          ) : null}
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((artifact, i) => (
            <ArtifactCard key={artifact.id} artifact={artifact} index={i} />
          ))}
        </div>
      )}

      <AnimatePresence>
        {showUpload && (
          <ArtifactUploadModal onClose={() => setShowUpload(false)} onSaved={handleSaved} />
        )}
      </AnimatePresence>
    </div>
  );
}