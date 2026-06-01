import { cn } from "@/lib/utils";
import { TrendingUp, RotateCcw, Sparkles, Moon } from "lucide-react";

export function getMomentum(penfire) {
  const count = penfire.occurrence_count || 1;
  const latestStr = penfire.latest_appearance || penfire.updated_date;
  const firstStr = penfire.first_appearance;

  if (!latestStr) return "new";

  const latest = new Date(latestStr);
  const now = new Date();
  const daysSinceLatest = (now - latest) / (1000 * 60 * 60 * 24);

  if (count === 1) return "new";
  if (daysSinceLatest > 30) return "dormant";

  if (firstStr) {
    const first = new Date(firstStr);
    const totalSpan = (latest - first) / (1000 * 60 * 60 * 24);
    const velocity = totalSpan > 0 ? count / totalSpan : count;
    if (velocity >= 0.3 || count >= 4) return "gaining";
  }

  return "returning";
}

const configs = {
  new:      { label: "New",              icon: Sparkles,    classes: "bg-sky-400/10 text-sky-400 border-sky-400/20" },
  returning:{ label: "Returning",        icon: RotateCcw,   classes: "bg-amber-400/10 text-amber-400 border-amber-400/20" },
  gaining:  { label: "Gaining Momentum", icon: TrendingUp,  classes: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20" },
  dormant:  { label: "Dormant",          icon: Moon,        classes: "bg-muted/40 text-muted-foreground border-border/30" },
};

export default function MomentumBadge({ penfire }) {
  const key = getMomentum(penfire);
  const { label, icon: Icon, classes } = configs[key];
  return (
    <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-medium", classes)}>
      <Icon className="w-2.5 h-2.5" />
      {label}
    </span>
  );
}