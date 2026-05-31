import { cn } from "@/lib/utils";

export default function TagBadge({ tag, className }) {
  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-wide",
      "bg-muted/60 text-muted-foreground border border-border/30",
      className
    )}>
      {tag}
    </span>
  );
}