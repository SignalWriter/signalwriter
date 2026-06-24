import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Plus, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function TagList({ items, onRemove }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted/40 border border-border/30 text-foreground/80">
          {item}
          {onRemove && <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-destructive ml-0.5"><X className="w-2.5 h-2.5" /></button>}
        </span>
      ))}
    </div>
  );
}

function FreeTextSection({ label, items, onAdd, onRemove }) {
  const [input, setInput] = useState("");
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      <TagList items={items} onRemove={onRemove} />
      <div className="flex gap-2 mt-2">
        <Input value={input} onChange={e => setInput(e.target.value)} placeholder={`Add ${label.toLowerCase()}...`} className="h-8 text-xs bg-background/50" onKeyDown={e => { if (e.key === "Enter" && input.trim()) { onAdd(input.trim()); setInput(""); }}} />
        <Button size="sm" variant="ghost" onClick={() => { if (input.trim()) { onAdd(input.trim()); setInput(""); }}} className="h-8 px-2"><Plus className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}

export default function ArtifactContinuity({ artifact }) {
  const [expanded, setExpanded] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [extractionIds, setExtractionIds] = useState(artifact.related_extraction_ids || []);
  const [penfireIds, setPenfireIds] = useState(artifact.related_penfire_ids || []);
  const [projects, setProjects] = useState(artifact.associated_projects || []);
  const [outcomes, setOutcomes] = useState(artifact.associated_outcomes || []);
  const [conversations, setConversations] = useState(artifact.associated_conversations || []);
  const [missions, setMissions] = useState(artifact.associated_missions || []);
  const queryClient = useQueryClient();

  const { data: allExtractions = [] } = useQuery({ queryKey: ["extractions-all"], queryFn: () => base44.entities.Extraction.list() });
  const { data: allPenfires = [] } = useQuery({ queryKey: ["penfires-all"], queryFn: () => base44.entities.Penfire.list() });

  const mutation = useMutation({
    mutationFn: () => base44.entities.Artifact.update(artifact.id, {
      related_extraction_ids: extractionIds,
      related_penfire_ids: penfireIds,
      associated_projects: projects,
      associated_outcomes: outcomes,
      associated_conversations: conversations,
      associated_missions: missions,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["artifact", artifact.id] }); setDirty(false); },
  });

  const mark = () => setDirty(true);

  const toggleExtraction = (id) => { setExtractionIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); mark(); };
  const togglePenfire = (id) => { setPenfireIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); mark(); };

  const totalLinks = extractionIds.length + penfireIds.length + projects.length + outcomes.length + conversations.length + missions.length;

  return (
    <div>
      <button onClick={() => setExpanded(e => !e)} className="flex items-center justify-between w-full group mb-3">
        <h3 className="font-display text-lg text-foreground flex items-center gap-2">
          <Link2 className="w-4 h-4 text-primary" />
          Continuity
          {totalLinks > 0 && <span className="text-xs text-muted-foreground font-body">({totalLinks} links)</span>}
        </h3>
        {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-5">
            {/* Extractions */}
            {allExtractions.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Associated Extractions</p>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {allExtractions.map(e => (
                    <label key={e.id} className="flex items-center gap-2.5 cursor-pointer group/item py-1">
                      <input type="checkbox" checked={extractionIds.includes(e.id)} onChange={() => toggleExtraction(e.id)} className="accent-primary" />
                      <span className="text-xs text-foreground/80 group-hover/item:text-foreground truncate">{e.title}</span>
                    </label>
                  ))}
                </div>
                {extractionIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {extractionIds.map(id => {
                      const e = allExtractions.find(x => x.id === id);
                      return e ? <Link key={id} to={`/extraction/${id}`} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">{e.title}</Link> : null;
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Penfires */}
            {allPenfires.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Associated Penfires</p>
                <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                  {allPenfires.map(p => (
                    <label key={p.id} className="flex items-center gap-2.5 cursor-pointer group/item py-1">
                      <input type="checkbox" checked={penfireIds.includes(p.id)} onChange={() => togglePenfire(p.id)} className="accent-primary" />
                      <span className="text-xs text-foreground/80 group-hover/item:text-foreground truncate">{p.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Free-text associations */}
            <FreeTextSection label="Associated Projects" items={projects} onAdd={v => { setProjects(p => [...p, v]); mark(); }} onRemove={i => { setProjects(p => p.filter((_, j) => j !== i)); mark(); }} />
            <FreeTextSection label="Associated Outcomes" items={outcomes} onAdd={v => { setOutcomes(p => [...p, v]); mark(); }} onRemove={i => { setOutcomes(p => p.filter((_, j) => j !== i)); mark(); }} />
            <FreeTextSection label="Associated Conversations" items={conversations} onAdd={v => { setConversations(p => [...p, v]); mark(); }} onRemove={i => { setConversations(p => p.filter((_, j) => j !== i)); mark(); }} />
            <FreeTextSection label="Associated Missions" items={missions} onAdd={v => { setMissions(p => [...p, v]); mark(); }} onRemove={i => { setMissions(p => p.filter((_, j) => j !== i)); mark(); }} />

            {dirty && (
              <div className="flex justify-end gap-2 pt-1">
                <Button size="sm" onClick={() => mutation.mutate()} disabled={mutation.isPending} className="gap-1.5 h-7 text-xs">
                  <Check className="w-3.5 h-3.5" /> Save Continuity
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}