import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

export default function SourceMetadata({ extraction }) {
  const wordCount = extraction.source_text
    ? extraction.source_text.trim().split(/\s+/).filter(Boolean).length
    : null;

  const rows = [
    extraction.source_platform && { label: "Source", value: extraction.source_platform },
    extraction.source_thread_title && { label: "Thread", value: `"${extraction.source_thread_title}"` },
    extraction.source_original_date && {
      label: "Original Date",
      value: format(new Date(extraction.source_original_date), "MMMM d, yyyy"),
    },
    extraction.created_date && {
      label: "Extracted",
      value: format(new Date(extraction.created_date), "MMMM d, yyyy"),
    },
    wordCount && { label: "Word Count", value: `${wordCount.toLocaleString()} words` },
    extraction.source_link && {
      label: "Link",
      value: (
        <a
          href={extraction.source_link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          View Source <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
  ].filter(Boolean);

  if (!rows.length) return null;

  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 px-5 py-4 mb-6">
      <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
        Source Metadata
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
              {row.label}
            </p>
            <p className="text-sm text-foreground/80 font-body">{row.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}