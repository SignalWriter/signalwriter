import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, Pencil, Check, X, Trash2, Plus, Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import BundleItemPicker from "@/components/bundles/BundleItemPicker";
import BundleExportModal from "@/components/bundles/BundleExportModal";
import MiraNote from "@/components/extraction/MiraNote";

const BUNDLE_TYPES = ["Writing Project", "Story Bible", "Product Development", "Research", "Marketing", "Business", "Worldbuilding", "Character", "Personal Philosophy", "Custom"];

const ITEM_TYPE_LABELS = {
  extraction: "Extraction",
  penfire: "Pattern",
  project: "Project",
  artifact: "Artifact",
  signal: "Signal",
  mission_alignment: "Mission",
  custom_note: "Note",
};

const ITEM_TYPE_COLORS = {
  extraction: "bg-violet-400/10 text-violet-400",
  penfire: "bg-orange-400/10 text-orange-400",
  project: "bg-blue-400/10 text-blue-400",
  artifact: "bg-emerald-400/10 text-emerald-400",
  signal: "bg-cyan-400/10 text-cyan-400",
  mission_alignment: "bg-rose-400/10 text-rose-400",
  custom_note: "bg-muted text-muted-foreground",
};

function generateId() { return Math.random().toString(36).slice(2, 10); }

export default function BundleDetail() {
  const id = window.location.pathname.split("/").pop();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingField, setEditingField] = useState(null);
  const [draft, setDraft] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [showCustomNote, setShowCustomNote] = useState(false);
  const [generatingInsight, setGeneratingInsight] = useState(false);

  const { data: bundle, isLoading } = useQuery({
    queryKey: ["bundle", id],
    queryFn: async () => { const list = await base44.entities.ContextBundle.filter({ id }); return list[0]; },
    enabled: !!id,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.ContextBundle.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["bundle", id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.ContextBundle.delete(id),
    onSuccess: () => navigate("/bundles"),
  });

  const saveField = (field, value) => { updateMutation.mutate({ [field]: value }); setEditingField(null); };

  const addItem = (item) => {
    updateMutation.mutate({ items: [...(bundle.items || []), item] });
  };

  const removeItem = (itemId) => {
    updateMutation.mutate({ items: (bundle.items || []).filter(i => i.id !== itemId) });
  };

  const addCustomNote = () => {
    if (!customNote.trim()) return;
    addItem({ id: generateId(), item_type: "custom_note", item_id: generateId(), label: "Custom Note", content_snapshot: customNote });
    setCustomNote("");
    setShowCustomNote(false);
  };

  const handleMiraInsight = async () => {
    if (!bundle) return;
    setGeneratingInsight(true);
    const items = bundle.items || [];
    const itemSummary = items.map(i => `${i.label} (${i.item_type})`).join(", ");
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `You are MIRA. Analyze this context bundle and provide a sharp, specific insight about what makes it powerful or what might be missing.

Bundle: "${bundle.title}"
Purpose: "${bundle.purpose || "not specified"}"
Items: ${itemSummary || "none yet"}

Write 1-3 sentences as MIRA, first-person, insightful, specific to this bundle's purpose. Focus on continuity value.`,
    });
    updateMutation.mutate({ mira_note: res });
    setGeneratingInsight(false);
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-[60vh]"><div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!bundle) return <div className="max-w-3xl mx-auto px-6 py-12 text-center"><p className="text-muted-foreground">Bundle not found.</p><Link to="/bundles" className="text-primary text-sm mt-2 inline-block">← Back to Bundles</Link></div>;

  const items = bundle.items || [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <div className="flex items-center justify-between mb-8">
        <Link to="/bundles" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Context Bundles
        </Link>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowExport(true)} className="gap-2 h-8 text-xs" disabled={items.length === 0}>
            <Download className="w-3.5 h-3.5" /> Export
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { if (confirm("Delete this bundle?")) deleteMutation.mutate(); }} className="h-8 text-xs text-destructive/60 hover:text-destructive">
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
        {/* Title & Type */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Select value={bundle.bundle_type || "Custom"} onValueChange={v => updateMutation.mutate({ bundle_type: v })}>
              <SelectTrigger className="w-44 h-7 text-xs bg-card/50"><SelectValue /></SelectTrigger>
              <SelectContent>{BUNDLE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            {bundle.mira_generated && <span className="text-[10px] text-primary/60 flex items-center gap-1"><Sparkles className="w-3 h-3" />MIRA Suggested</span>}
          </div>

          {editingField === "title" ? (
            <div className="space-y-2">
              <Input value={draft} onChange={e => setDraft(e.target.value)} className="font-display text-2xl bg-muted/30" autoFocus onKeyDown={e => e.key === "Enter" && saveField("title", draft)} />
              <div className="flex gap-2"><Button size="sm" onClick={() => saveField("title", draft)} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingField(null)} className="h-7 text-xs text-muted-foreground">Cancel</Button></div>
            </div>
          ) : (
            <div className="group flex items-start gap-2 cursor-pointer" onClick={() => { setEditingField("title"); setDraft(bundle.title); }}>
              <h1 className="font-display text-3xl text-foreground">{bundle.title}</h1>
              <Pencil className="w-4 h-4 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-2" />
            </div>
          )}

          {editingField === "purpose" ? (
            <div className="space-y-2 mt-3">
              <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="bg-muted/30 text-sm" autoFocus placeholder="What task or conversation does this bundle prepare your AI for?" />
              <div className="flex gap-2"><Button size="sm" onClick={() => saveField("purpose", draft)} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingField(null)} className="h-7 text-xs text-muted-foreground">Cancel</Button></div>
            </div>
          ) : (
            <div className="group flex items-start gap-2 cursor-pointer mt-2" onClick={() => { setEditingField("purpose"); setDraft(bundle.purpose || ""); }}>
              <p className="text-sm text-muted-foreground">{bundle.purpose || <span className="italic text-muted-foreground/30">Click to add a purpose — what should your AI know before using this bundle?</span>}</p>
              <Pencil className="w-3 h-3 text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors mt-0.5 flex-shrink-0" />
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/20 flex-wrap">
          <div className="text-center"><p className="text-lg font-display text-foreground">{items.length}</p><p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.1em]">Items</p></div>
          <div className="h-8 w-px bg-border/30" />
          <div className="text-center"><p className="text-lg font-display text-foreground">{bundle.use_count || 0}</p><p className="text-[10px] text-muted-foreground/50 uppercase tracking-[0.1em]">Exports</p></div>
          {bundle.last_used && (
            <><div className="h-8 w-px bg-border/30" />
            <div><p className="text-xs text-muted-foreground/50">Last used {format(new Date(bundle.last_used), "MMM d, yyyy")}</p></div></>
          )}
        </div>

        {/* MIRA Note */}
        {bundle.mira_note && <MiraNote message={bundle.mira_note} />}

        <div className="flex justify-end">
          <Button size="sm" variant="ghost" onClick={handleMiraInsight} disabled={generatingInsight} className="gap-1.5 text-xs text-muted-foreground h-7">
            {generatingInsight ? <><div className="w-3 h-3 border border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />Analyzing...</> : <><Sparkles className="w-3 h-3" />{bundle.mira_note ? "Refresh MIRA Insight" : "Get MIRA Insight"}</>}
          </Button>
        </div>

        {/* Custom Instructions */}
        <div>
          <p className="text-xs text-muted-foreground/50 uppercase tracking-[0.1em] mb-2">Custom Instructions</p>
          {editingField === "custom_instructions" ? (
            <div className="space-y-2">
              <Textarea value={draft} onChange={e => setDraft(e.target.value)} className="bg-muted/30 text-sm min-h-[80px]" autoFocus placeholder="Instructions to prepend to exported context (e.g. 'You are writing in a noir style. Do not break character.')" />
              <div className="flex gap-2"><Button size="sm" onClick={() => saveField("custom_instructions", draft)} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Save</Button><Button size="sm" variant="ghost" onClick={() => setEditingField(null)} className="h-7 text-xs text-muted-foreground">Cancel</Button></div>
            </div>
          ) : (
            <div className="group cursor-pointer" onClick={() => { setEditingField("custom_instructions"); setDraft(bundle.custom_instructions || ""); }}>
              {bundle.custom_instructions ? (
                <div className="p-4 rounded-xl bg-muted/20 border border-border/30 hover:border-border/50 transition-colors">
                  <p className="text-sm text-foreground/75 leading-relaxed whitespace-pre-wrap">{bundle.custom_instructions}</p>
                </div>
              ) : (
                <div className="p-4 rounded-xl border border-dashed border-border/30 hover:border-border/50 transition-colors">
                  <p className="text-xs text-muted-foreground/30 italic">Add custom instructions to prepend to your AI prompt...</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bundle Items */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs text-muted-foreground/50 uppercase tracking-[0.1em]">Bundle Items ({items.length})</p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowCustomNote(v => !v)} className="h-7 text-xs text-muted-foreground gap-1.5">
                <Plus className="w-3 h-3" /> Note
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowPicker(v => !v)} className="h-7 text-xs text-muted-foreground gap-1.5">
                <Plus className="w-3 h-3" /> Add Items
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showCustomNote && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                <div className="p-4 rounded-xl border border-border/40 bg-card/50 space-y-2">
                  <Textarea value={customNote} onChange={e => setCustomNote(e.target.value)} placeholder="Add a custom note, instruction, or piece of context..." className="bg-background/50 min-h-[70px] text-sm" autoFocus />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={addCustomNote} disabled={!customNote.trim()} className="h-7 text-xs gap-1"><Check className="w-3 h-3" />Add Note</Button>
                    <Button size="sm" variant="ghost" onClick={() => setShowCustomNote(false)} className="h-7 text-xs text-muted-foreground">Cancel</Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showPicker && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-3">
                <div className="p-4 rounded-xl border border-border/40 bg-card/50">
                  <BundleItemPicker selectedItems={items} onAdd={addItem} onRemove={removeItem} />
                  <Button size="sm" variant="ghost" onClick={() => setShowPicker(false)} className="mt-3 h-7 text-xs text-muted-foreground">Done</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {items.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-border/30 text-center">
              <Package className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/40">No items yet. Add extractions, penfires, projects, artifacts, or signals.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 p-3 rounded-xl border border-border/30 bg-card/40 group hover:border-border/50 transition-colors">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${ITEM_TYPE_COLORS[item.item_type] || "bg-muted text-muted-foreground"}`}>{ITEM_TYPE_LABELS[item.item_type] || item.item_type}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/85 font-medium truncate">{item.label}</p>
                    {item.content_snapshot && <p className="text-xs text-muted-foreground/50 mt-0.5 line-clamp-2 leading-relaxed">{item.content_snapshot}</p>}
                  </div>
                  <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive flex-shrink-0">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Export CTA */}
        {items.length > 0 && (
          <div className="p-5 rounded-xl border border-primary/15 bg-primary/5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Ready to export</p>
              <p className="text-xs text-muted-foreground mt-0.5">This bundle contains {items.length} items. Export as a plain text, markdown, or LLM prompt.</p>
            </div>
            <Button onClick={() => setShowExport(true)} className="gap-2 flex-shrink-0">
              <Download className="w-4 h-4" /> Export Bundle
            </Button>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showExport && (
          <BundleExportModal bundle={bundle} onClose={() => setShowExport(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}