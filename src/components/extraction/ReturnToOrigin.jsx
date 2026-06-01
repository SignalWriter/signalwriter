import { format } from "date-fns";
import { ExternalLink, MapPin } from "lucide-react";

const Field = ({ label, children }) => (
  <div>
    <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
    <div className="text-sm text-foreground/85 font-body">{children}</div>
  </div>
);

export default function ReturnToOrigin({ extraction }) {
  const hasAnyProvenance =
    extraction.source_platform ||
    extraction.source_thread_title ||
    extraction.source_thread_url ||
    extraction.source_link ||
    extraction.source_original_date ||
    extraction.user_alias;

  if (!hasAnyProvenance) return null;

  const sourceUrl = extraction.source_thread_url || extraction.source_link;

  const formatTimestamp = (val) => {
    try {
      const d = new Date(val);
      if (isNaN(d)) return val;
      // If it has a time component beyond midnight, show time too
      return d.getHours() === 0 && d.getMinutes() === 0
        ? format(d, "MMMM d, yyyy")
        : format(d, "MMMM d, yyyy · h:mm a");
    } catch {
      return val;
    }
  };

  return (
    <div className="rounded-xl border border-amber-400/15 bg-amber-400/4 px-5 py-4 mb-6 space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-3.5 h-3.5 text-amber-400/70" />
        <p className="text-[10px] font-medium uppercase tracking-widest text-amber-400/80">
          Return to Origin
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {/* Emergence Title — always shown, it's the primary title */}
        <div className="sm:col-span-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-1">
            Emergence Title
          </p>
          <p className="text-sm text-foreground font-body font-medium">{extraction.title}</p>
        </div>

        {extraction.user_alias && (
          <Field label="Your Alias">
            <span className="italic text-foreground/70">{extraction.user_alias}</span>
          </Field>
        )}

        {extraction.source_platform && (
          <Field label="Source Platform">
            {extraction.source_platform}
          </Field>
        )}

        {extraction.source_thread_title && (
          <div className="sm:col-span-2">
            <Field label="Source Thread Title">
              <span className="italic">"{extraction.source_thread_title}"</span>
            </Field>
          </div>
        )}

        {extraction.source_original_date && (
          <Field label="Conversation Timestamp">
            {formatTimestamp(extraction.source_original_date)}
          </Field>
        )}

        {sourceUrl && (
          <Field label="Source Link">
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              Open Original <ExternalLink className="w-3 h-3" />
            </a>
          </Field>
        )}
      </div>
    </div>
  );
}