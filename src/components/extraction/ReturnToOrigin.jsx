import { format } from "date-fns";
import { ExternalLink, MapPin, Sparkles } from "lucide-react";

const Field = ({ label, children }) => (
  <div>
    <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-muted-foreground mb-1">{label}</p>
    <div className="text-sm text-foreground/85 font-body">{children}</div>
  </div>
);

const SectionDivider = ({ icon: Icon, label, color }) => (
  <div className={`flex items-center gap-2 pt-2`}>
    <Icon className={`w-3 h-3 ${color}`} />
    <p className={`text-[9px] font-medium uppercase tracking-[0.14em] ${color}`}>{label}</p>
  </div>
);

export default function ReturnToOrigin({ extraction }) {
  const hasProvenance =
    extraction.source_platform ||
    extraction.source_thread_title ||
    extraction.source_thread_url ||
    extraction.source_link ||
    extraction.source_original_date;

  const hasAlias = !!extraction.user_alias;
  const hasAny = hasProvenance || hasAlias;

  if (!hasAny) return null;

  const sourceUrl = extraction.source_thread_url || extraction.source_link;

  const formatTimestamp = (val) => {
    try {
      const d = new Date(val);
      if (isNaN(d)) return val;
      return d.getHours() === 0 && d.getMinutes() === 0
        ? format(d, "MMMM d, yyyy")
        : format(d, "MMMM d, yyyy · h:mm a");
    } catch {
      return val;
    }
  };

  return (
    <div className="rounded-xl border border-amber-400/15 bg-amber-400/[0.03] overflow-hidden">
      {/* Return to Origin */}
      {hasProvenance && (
        <div className="px-5 pt-4 pb-5">
          <SectionDivider icon={MapPin} label="Return to Origin" color="text-amber-400/80" />
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3.5">
            {extraction.source_thread_title && (
              <div className="sm:col-span-2">
                <Field label="Source Thread Title">
                  <span className="italic text-foreground/90">"{extraction.source_thread_title}"</span>
                </Field>
              </div>
            )}

            {extraction.source_platform && (
              <Field label="Source Platform">
                <span className="inline-flex items-center px-2 py-0.5 rounded bg-muted/60 text-xs text-foreground/80 border border-border/30">
                  {extraction.source_platform}
                </span>
              </Field>
            )}

            {extraction.source_original_date && (
              <Field label="Conversation Timestamp">
                {formatTimestamp(extraction.source_original_date)}
              </Field>
            )}

            {sourceUrl && (
              <Field label="Source Thread URL">
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-primary hover:underline text-sm"
                >
                  Open Original Source <ExternalLink className="w-3 h-3" />
                </a>
              </Field>
            )}

            {extraction.user_alias && (
              <Field label="User Alias">
                <span className="italic text-foreground/70">"{extraction.user_alias}"</span>
              </Field>
            )}
          </div>
        </div>
      )}

      {/* If only alias, no provenance */}
      {!hasProvenance && hasAlias && (
        <div className="px-5 pt-4 pb-5">
          <SectionDivider icon={MapPin} label="Return to Origin" color="text-amber-400/80" />
          <div className="mt-3">
            <Field label="User Alias">
              <span className="italic text-foreground/70">"{extraction.user_alias}"</span>
            </Field>
          </div>
        </div>
      )}

      {/* Divider between sections */}
      <div className="border-t border-amber-400/10 mx-5" />

      {/* Emergence */}
      <div className="px-5 pt-4 pb-5">
        <SectionDivider icon={Sparkles} label="Emergence" color="text-amber-300/70" />
        <div className="mt-3">
          <Field label="Emergence Title">
            <span className="font-medium text-foreground">{extraction.title}</span>
          </Field>
        </div>
      </div>
    </div>
  );
}