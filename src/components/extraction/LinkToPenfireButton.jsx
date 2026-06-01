import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Flame, Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function LinkToPenfireButton({ extraction }) {
  const [saving, setSaving] = useState(null); // penfire id being saved
  const [saved, setSaved] = useState(null);   // penfire id just saved
  const queryClient = useQueryClient();

  const { data: penfires = [] } = useQuery({
    queryKey: ["penfires-link"],
    queryFn: () => base44.entities.Penfire.list("-updated_date", 50),
  });

  const alreadyLinked = (penfire) =>
    (penfire.related_extraction_ids || []).includes(extraction.id);

  const handleLink = async (penfire) => {
    if (alreadyLinked(penfire)) return;
    setSaving(penfire.id);

    const updatedIds = [...(penfire.related_extraction_ids || []), extraction.id];
    const updatedInsights = extraction.core_insight
      ? [...(penfire.related_insights || []), extraction.core_insight]
      : penfire.related_insights;

    await base44.entities.Penfire.update(penfire.id, {
      related_extraction_ids: updatedIds,
      related_insights: updatedInsights,
      occurrence_count: (penfire.occurrence_count || 1) + 1,
      latest_appearance: new Date().toISOString().split("T")[0],
    });

    queryClient.invalidateQueries({ queryKey: ["penfires-link"] });
    queryClient.invalidateQueries({ queryKey: ["penfires-page"] });
    setSaving(null);
    setSaved(penfire.id);
    setTimeout(() => setSaved(null), 2000);
  };

  if (penfires.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Flame className="w-3.5 h-3.5 text-primary" />
          Link to Penfire
          <ChevronDown className="w-3 h-3 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        {penfires.map((penfire) => {
          const linked = alreadyLinked(penfire);
          const isSaving = saving === penfire.id;
          const isSaved = saved === penfire.id;
          return (
            <DropdownMenuItem
              key={penfire.id}
              onClick={() => handleLink(penfire)}
              disabled={linked || isSaving}
              className="flex items-center justify-between gap-2 cursor-pointer"
            >
              <span className="flex items-center gap-2 truncate">
                <Flame className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="truncate text-sm">{penfire.name}</span>
              </span>
              {(linked || isSaved) && (
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
              {isSaving && (
                <div className="w-3.5 h-3.5 border border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}