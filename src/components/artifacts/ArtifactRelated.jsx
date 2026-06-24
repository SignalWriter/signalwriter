import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Network, Plus, X, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TYPE_COLORS } from "./ArtifactCard";
import { Layers } from "lucide-react";

export default function ArtifactRelated({ artifact }) {
  const [showSearch, setShowSearch] = useState(false);
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const { data: allArtifacts = [] } = useQuery({
    queryKey: ["artifacts-all"],
    queryFn: () => base44.entities.Artifact.filter({ status: "active" }),
  });

  const relatedIds = artifact.related_artifact_ids || [];
  const linked = allArtifacts.filter(a => relatedIds.includes(a.id));
  const similar = allArtifacts.filter(a =>
    a.id !== artifact.id &&
    !relatedIds.includes(a.id) &&
    (artifact.artifact_types || []).some(t => (a.artifact_types || []).includes(t))
  ).slice(0, 4);

  const saveMutation = useMutation({
    mutationFn: (ids) => base44.entities.Artifact.update(artifact.id, { related_artifact_ids: ids }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["artifact", artifact.id] }),
  });

  const addRelated = (id) => saveMutation.mutate([...relatedIds, id]);
  const removeRelated = (id) => saveMutation.mutate(relatedIds.filter(x => x !== id));

  const searchResults = allArtifacts.filter(a =>
    a.id !== artifact.id &&
    !relatedIds.includes(a.id) &&
    a.title?.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 8);

  if (allArtifacts.length <= 1) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-foreground flex items-center gap-2">
          <Network className="w-4 h-4 text-primary" />
          Related Artifacts
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setShowSearch(s => !s)} className="gap-1.5 text-xs text-muted-foreground h-7">
          <Plus className="w-3.5 h-3.5" /> Link
        </Button>
      </div>

      <AnimatePresence>
        {showSearch && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4 space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search artifacts to link..." className="pl-8 h-8 text-xs bg-background/50" />
            </div>
            {search && (
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <p className="text-xs text-muted-foreground/50 p-2">No matches</p>
                ) : searchResults.map(a => (
                  <button key={a.id} onClick={() => { addRelated(a.id); setSearch(""); }} className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-muted/40 transition-colors text-left">
                    <div className="w-8 h-8 rounded overflow-hidden bg-muted/30 flex-shrink-0">
                      {a.image_url ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Layers className="w-3 h-3 text-muted-foreground/30" /></div>}
                    </div>
                    <span className="text-xs text-foreground/80 truncate">{a.title}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explicitly linked */}
      {linked.length > 0 && (
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Linked</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {linked.map(a => (
              <div key={a.id} className="relative group">
                <Link to={`/artifact/${a.id}`} className="block rounded-lg overflow-hidden border border-border/40 hover:border-primary/30 transition-all">
                  <div className="aspect-square bg-muted/30">
                    {a.image_url ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Layers className="w-5 h-5 text-muted-foreground/20" /></div>}
                  </div>
                  <p className="text-[10px] p-1.5 truncate text-muted-foreground">{a.title}</p>
                </Link>
                <button onClick={() => removeRelated(a.id)} className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Similar by type */}
      {similar.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Similar Type</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {similar.map(a => (
              <Link key={a.id} to={`/artifact/${a.id}`} className="block rounded-lg overflow-hidden border border-border/40 hover:border-primary/30 transition-all opacity-70 hover:opacity-100">
                <div className="aspect-square bg-muted/30">
                  {a.image_url ? <img src={a.image_url} alt={a.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><Layers className="w-5 h-5 text-muted-foreground/20" /></div>}
                </div>
                <p className="text-[10px] p-1.5 truncate text-muted-foreground">{a.title}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}