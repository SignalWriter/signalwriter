import { format } from "date-fns";
import { ExternalLink } from "lucide-react";

export default function SourceMetadata({ extraction }) {
  const wordCount = extraction.source_text
    ? extraction.source_text.trim().split(/\s+/).filter(Boolean).length
    : null;

  return (
    <div className="rounded-xl border border-border/40 bg-muted/20 px-5 py-4 mb-6 space-y-4">
      {/* TITLE */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
          Title
        </p>
        <p className="text-sm text-foreground/90 font-body">{extraction.title}</p>
      </div>

      {/* SOURCE TYPE */}
      {extraction.source_type && (
        <div>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
            Source Type
          </p>
          <p className="text-sm text-foreground/80 font-body capitalize">
            {extraction.source_type.replace(/_/g, " ")}
          </p>
        </div>
      )}

      {/* SOURCE METADATA */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-3">
          Source Metadata
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3">
          {extraction.source_platform && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Platform</p>
              <p className="text-sm text-foreground/80 font-body">{extraction.source_platform}</p>
            </div>
          )}
          {extraction.source_thread_title && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Thread Title</p>
              <p className="text-sm text-foreground/80 font-body">"{extraction.source_thread_title}"</p>
            </div>
          )}
          {extraction.source_original_date && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Original Date</p>
              <p className="text-sm text-foreground/80 font-body">
                {format(new Date(extraction.source_original_date), "MMMM d, yyyy")}
              </p>
            </div>
          )}
          {extraction.created_date && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Extraction Date</p>
              <p className="text-sm text-foreground/80 font-body">
                {format(new Date(extraction.created_date), "MMMM d, yyyy")}
              </p>
            </div>
          )}
          {wordCount && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Word Count</p>
              <p className="text-sm text-foreground/80 font-body">{wordCount.toLocaleString()} words</p>
            </div>
          )}
          {extraction.source_link && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Source Link</p>
              <a
                href={extraction.source_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
              >
                View Source <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}