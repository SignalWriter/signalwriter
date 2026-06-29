import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Package, Plus, Sparkles, ArrowRight, Archive, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import EmptyState from "@/components/shared/EmptyState";
import MiraNote from "@/components/extraction/MiraNote";

const BUNDLE_TYPES = ["Writing Project", "Story Bible", "Product Development", "Research", "Marketing", "Business", "Worldbuilding", "Character", "Personal Philosophy", "Custom"];

const TYPE_COLORS = {
  "Writing Project": "bg-violet-400/10 text-violet-400",
  "Story Bible": "bg-purple-400/10 text-purple-400",
  "Product Development": "bg-blue-400/10 text-blue-400",
  "Research": "bg-cyan-400/10 text-cyan-400",
  "Marketing": "bg-pink-400/10 text-pink-400",
  "Business": "bg-amber-400/10 text-amber-400",
  "Worldbuilding": "bg-emerald-400/10 text-emerald-400",
  "Character": "bg-orange-400/10 text-orange-400",
  "Personal Philosophy": "bg-rose-400/10 text-rose-400",
  "Custom": "bg-muted text-muted-foreground",
};

function NewBundleForm({ onSave, onCancel }) {
  const [title, setTitle] = useState("");
  const [purpose, setPurpose] = useState("");
  const [bundleType, setBundleType] = useState("Custom");

  return (
    <div className="p-5 rounded-xl border border-primary/20 bg-card/60 space-y-4">
      <h3 className="font-display text-lg text-foreground">New Context Bundle</h3>
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bundle title *" className="bg-background/50" autoFocus />
      <Textarea value={purpose} onChange={e => setPurpose(e.target.value)} placeholder="What task or conversation does this prepare your AI for?" className="bg-background/50 min-h-[70px]" />
      <Select value={bundleType} onValueChange={setBundleType}>
        <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
        <SelectContent>{BUNDLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button onClick={() => onSave({ title, purpose, bundle_type: bundleType })} disabled={!title.trim()} className="gap-2">
          <Plus className="w-4 h-4" /> Create Bundle
        </Button>
        <Button variant="ghost" onClick={onCancel} className="text-muted-foreground">Cancel</Button>
      </div>
    </div>
  );
}

function MiraRecommendation({ extractions, projects, onAccept }) {
  const [generating, setGenerating] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContextBundle.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["context-bundles"] }); setSuggestion(null); },
  });

  const handleGenerate = async () => {
    if (extractions.length === 0 && projects.length === 0) return;
    setGenerating(true);

    const recentTitles = extractions.slice(0, 5).map(e => e.title || e.core_insight?.slice(0, 60)).filter(Boolean).join(", ");
    const projectNames = projects.slice(0, 3).map(p => p.title).join(", ");

    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are MIRA, an intelligent continuity assistant. Based on the user's recent activity, suggest ONE focused context bundle.

Recent extractions: ${recentTitles || "none"}
Active projects: ${projectNames || "none"}

Respond with JSON containing:
- bundle_title: string (evocative, specific)
- bundle_type: one of ["Writing Project","Story Bible","Product Development","Research","Marketing","Business","Worldbuilding","Character","Personal Philosophy","Custom"]
- purpose: string (1-2 sentences describing what AI task this prepares for)
- mira_note: string (MIRA's brief, first-person observation about why this bundle is relevant right now)
- suggested_labels: array of 4-7 strings (items to include, named from the user's actual extractions/projects)`,
      response_json_schema: {
        type: "object",
        properties: {
          bundle_title: { type: "string" },
          bundle_type: { type: "string" },
          purpose: { type: "string" },
          mira_note: { type: "string" },
          suggested_labels: { type: "array", items: { type: "string" } }
        }
      }
    });

    setSuggestion(res);
    setGenerating(false);
  };

  const handleAccept = () => {
    if (!suggestion) return;
    createMutation.mutate({
      title: suggestion.bundle_title,
      purpose: suggestion.purpose,
      bundle_type: suggestion.bundle_type,
      mira_generated: true,
      mira_note: suggestion.mira_note,
      items: [],
    });
  };

  return (
    <div className="p-5 rounded-xl border border-primary/15 bg-primary/5 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">MIRA Recommendation</span>
      </div>

      {!suggestion ? (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Let MIRA analyze your recent activity and suggest the most relevant context bundle for your current work.
          </p>
          <Button size="sm" onClick={handleGenerate} disabled={generating} className="gap-2">
            {generating ? (
              <><div className="w-3 h-3 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Analyzing...</>
            ) : (
              <><Sparkles className="w-3.5 h-3.5" />Generate Recommendation</>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground/60 uppercase tracking-[0.1em] mb-1">Suggested bundle</p>
            <p className="text-base font-display text-foreground">{suggestion.bundle_title}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${TYPE_COLORS[suggestion.bundle_type] || TYPE_COLORS.Custom}`}>{suggestion.bundle_type}</span>
          </div>
          <p className="text-xs text-foreground/70 leading-relaxed">{suggestion.purpose}</p>
          {suggestion.mira_note && <MiraNote message={suggestion.mira_note} />}
          {suggestion.suggested_labels?.length > 0 && (
            <div>
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.1em] mb-1.5">Suggested items</p>
              <div className="flex flex-wrap gap-1.5">
                {suggestion.suggested_labels.map((label, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/40 text-muted-foreground border border-border/30">{label}</span>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleAccept} disabled={createMutation.isPending} className="gap-1.5 h-7 text-xs">
              <Plus className="w-3 h-3" /> Create This Bundle
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSuggestion(null)} className="h-7 text-xs text-muted-foreground">Try Again</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ContextBundles() {
  const [showNew, setShowNew] = useState(false);
  const queryClient = useQueryClient();

  const { data: bundles = [], isLoading } = useQuery({
    queryKey: ["context-bundles"],
    queryFn: () => base44.entities.ContextBundle.filter({ status: "active" }, "-updated_date"),
  });

  const { data: extractions = [] } = useQuery({
    queryKey: ["extractions-all"],
    queryFn: () => base44.entities.Extraction.filter({ status: "active" }, "-created_date", 20),
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: () => base44.entities.Project.list("-created_date"),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ContextBundle.create({ ...data, items: [], use_count: 0 }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["context-bundles"] }); setShowNew(false); },
  });

  const mostUsed = [...bundles].sort((a, b) => (b.use_count || 0) - (a.use_count || 0)).slice(0, 3);

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Context Bundles</h1>
          <p className="text-sm text-muted-foreground">Every AI conversation should begin with context, not reconstruction.</p>
        </div>
        <Button onClick={() => setShowNew(true)} className="gap-2 flex-shrink-0">
          <Plus className="w-4 h-4" /> New Bundle
        </Button>
      </motion.div>

      <AnimatePresence>
        {showNew && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6">
            <NewBundleForm onSave={(data) => createMutation.mutate(data)} onCancel={() => setShowNew(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* MIRA Recommendation */}
      <div className="mb-8">
        <MiraRecommendation extractions={extractions} projects={projects} />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>
      ) : bundles.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No context bundles yet"
          description="Build reusable context packages so your AI always knows what matters — without you repeating yourself."
          action={<Button onClick={() => setShowNew(true)} className="gap-2"><Plus className="w-4 h-4" />Create First Bundle</Button>}
        />
      ) : (
        <div className="space-y-6">
          {/* Most Used */}
          {mostUsed.some(b => b.use_count > 0) && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-3">Most Used</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                {mostUsed.filter(b => b.use_count > 0).map(bundle => (
                  <Link key={bundle.id} to={`/bundle/${bundle.id}`} className="p-4 rounded-xl border border-primary/20 bg-primary/5 hover:border-primary/40 transition-all group">
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">{bundle.title}</p>
                    <p className="text-[10px] text-muted-foreground/50 mt-1">{bundle.use_count} export{bundle.use_count !== 1 ? "s" : ""}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* All Bundles */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 mb-3">All Bundles</p>
            <div className="space-y-3">
              {bundles.map((bundle, i) => (
                <motion.div key={bundle.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Link to={`/bundle/${bundle.id}`} className="block p-5 rounded-xl border border-border/40 bg-card/50 hover:border-primary/30 hover:bg-card transition-all group">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${TYPE_COLORS[bundle.bundle_type] || TYPE_COLORS.Custom}`}>{bundle.bundle_type || "Custom"}</span>
                          {bundle.mira_generated && (
                            <span className="text-[10px] flex items-center gap-0.5 text-primary/60"><Sparkles className="w-2.5 h-2.5" />MIRA</span>
                          )}
                        </div>
                        <h3 className="font-display text-xl text-foreground group-hover:text-primary transition-colors">{bundle.title}</h3>
                        {bundle.purpose && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{bundle.purpose}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-muted-foreground/40">{(bundle.items || []).length} items</span>
                          {bundle.use_count > 0 && <span className="text-[10px] text-muted-foreground/40">{bundle.use_count} exports</span>}
                          {bundle.last_used && <span className="text-[10px] text-muted-foreground/30 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{format(new Date(bundle.last_used), "MMM d")}</span>}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}