import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Search, Check, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const TABS = [
  { key: "extraction", label: "Extractions" },
  { key: "penfire", label: "Penfires" },
  { key: "project", label: "Projects" },
  { key: "artifact", label: "Artifacts" },
  { key: "signal", label: "Signals" },
];

function generateId() { return Math.random().toString(36).slice(2, 10); }

function snapshotForItem(type, record) {
  switch (type) {
    case "extraction":
      return [record.core_insight, (record.thought_seeds || []).map(s => s.content).join(" | ")].filter(Boolean).join("\n\n");
    case "penfire":
      return [record.description, (record.related_insights || []).join(" | ")].filter(Boolean).join("\n\n");
    case "project":
      return [record.canon_summary, (record.canon_entries || []).map(e => `${e.name}: ${e.description}`).join("\n")].filter(Boolean).join("\n\n");
    case "artifact":
      return [record.description, record.notes, record.emergence_summary].filter(Boolean).join("\n\n");
    case "signal":
      return [record.summary, (record.key_quotes || []).join(" | ")].filter(Boolean).join("\n\n");
    default:
      return "";
  }
}

function labelForItem(type, record) {
  return record.title || record.name || "Untitled";
}

export default function BundleItemPicker({ selectedItems, onAdd, onRemove }) {
  const [tab, setTab] = useState("extraction");
  const [search, setSearch] = useState("");

  const { data: extractions = [] } = useQuery({ queryKey: ["extractions-all"], queryFn: () => base44.entities.Extraction.filter({ status: "active" }, "-created_date", 50) });
  const { data: penfires = [] } = useQuery({ queryKey: ["penfires"], queryFn: () => base44.entities.Penfire.list("-occurrence_count", 50) });
  const { data: projects = [] } = useQuery({ queryKey: ["projects"], queryFn: () => base44.entities.Project.list("-created_date") });
  const { data: artifacts = [] } = useQuery({ queryKey: ["artifacts"], queryFn: () => base44.entities.Artifact.filter({ status: "active" }, "-created_date", 50) });
  const { data: signals = [] } = useQuery({ queryKey: ["signals"], queryFn: () => base44.entities.Signal.filter({ status: "active" }, "-created_date", 50) });

  const recordsByTab = { extraction: extractions, penfire: penfires, project: projects, artifact: artifacts, signal: signals };
  const records = recordsByTab[tab] || [];

  const filtered = records.filter(r => {
    const label = labelForItem(tab, r).toLowerCase();
    return label.includes(search.toLowerCase());
  });

  const selectedIds = new Set((selectedItems || []).map(i => i.item_id));

  const toggle = (record) => {
    const id = record.id;
    if (selectedIds.has(id)) {
      onRemove(id);
    } else {
      onAdd({
        id: generateId(),
        item_type: tab,
        item_id: id,
        label: labelForItem(tab, record),
        content_snapshot: snapshotForItem(tab, record),
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-1 flex-wrap">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${tab === t.key ? "bg-primary/15 text-primary" : "bg-muted/30 text-muted-foreground hover:text-foreground"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={`Search ${tab}s...`}
          className="pl-8 h-8 text-xs bg-background/50"
        />
      </div>

      <div className="max-h-[240px] overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground/40 italic py-4 text-center">No {tab}s found.</p>
        )}
        {filtered.map(record => {
          const isSelected = selectedIds.has(record.id);
          return (
            <button
              key={record.id}
              onClick={() => toggle(record)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${isSelected ? "bg-primary/10 border border-primary/20" : "bg-muted/20 border border-transparent hover:border-border/40"}`}
            >
              <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${isSelected ? "bg-primary border-primary" : "border-border/50"}`}>
                {isSelected && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
              </div>
              <span className="text-xs text-foreground/85 flex-1 truncate">{labelForItem(tab, record)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}