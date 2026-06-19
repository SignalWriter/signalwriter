import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, TrendingUp, Minus, TrendingDown, Quote } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import SignalTimeline from "@/components/signals/SignalTimeline";
import SignalActions from "@/components/signals/SignalActions";
import MergeSignalModal from "@/components/signals/MergeSignalModal";
import TagBadge from "@/components/shared/TagBadge";

const trendConfig = {
  growing: { icon: TrendingUp, label: "Growing", color: "text-green-400", bg: "bg-green-400/10" },
  stable: { icon: Minus, label: "Stable", color: "text-blue-400", bg: "bg-blue-400/10" },
  fading: { icon: TrendingDown, label: "Fading", color: "text-muted-foreground", bg: "bg-muted/30" },
};

export default function SignalDetail() {
  const id = window.location.pathname.split("/").pop();
  const navigate = useNavigate();
  const [showMerge, setShowMerge] = useState(false);

  const { data: signal, isLoading } = useQuery({
    queryKey: ["signal", id],
    queryFn: async () => {
      const list = await base44.entities.Signal.filter({ id });
      return list[0];
    },
    enabled: !!id,
  });

  const { data: allSignals = [] } = useQuery({
    queryKey: ["signals"],
    queryFn: () => base44.entities.Signal.filter({ status: "active" }, "-last_seen", 100),
    enabled: !!signal,
  });

  const { data: allExtractions = [] } = useQuery({
    queryKey: ["all-extractions"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 200),
    enabled: !!signal,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!signal) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-12 text-center">
        <p className="text-muted-foreground">Signal not found.</p>
        <Link to="/signals" className="text-primary text-sm mt-2 inline-block">← Back to Signals</Link>
      </div>
    );
  }

  const trend = trendConfig[signal.trend] || trendConfig.stable;
  const TrendIcon = trend.icon;
  const relatedExtractions = allExtractions.filter(e =>
    (signal.related_extraction_ids || []).includes(e.id)
  );
  const influencedProjects = relatedExtractions.filter(e => e.outcome?.status);
  const relatedSignals = allSignals.filter(s =>
    s.id !== signal.id && (signal.related_signal_ids || []).includes(s.id)
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <Link
        to="/signals"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Signals
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-3">
          <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${trend.bg} ${trend.color}`}>
            <TrendIcon className="w-3 h-3" />
            {trend.label}
          </span>
          <span className="text-xs text-muted-foreground">
            {signal.related_extraction_ids?.length || 0} extraction{(signal.related_extraction_ids?.length || 0) !== 1 ? "s" : ""}
          </span>
        </div>

        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-3">{signal.name}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">{signal.summary}</p>

        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-8 flex-wrap">
          {signal.first_seen && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              First seen {format(new Date(signal.first_seen), "MMMM yyyy")}
            </span>
          )}
          {signal.last_seen && (
            <span>Last seen {format(new Date(signal.last_seen), "MMMM yyyy")}</span>
          )}
        </div>
      </motion.div>

      <div className="mb-10">
        <SignalActions signal={signal} onArchive={() => navigate("/signals")} onMerge={() => setShowMerge(true)} />
      </div>

      {signal.key_quotes?.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-10">
          <h2 className="font-display text-xl text-foreground mb-4 flex items-center gap-2">
            <Quote className="w-4 h-4 text-primary" />
            Key Quotes
          </h2>
          <div className="space-y-3">
            {signal.key_quotes.map((quote, i) => (
              <div key={i} className="pl-4 border-l-2 border-primary/30 py-1">
                <p className="text-sm text-foreground/80 italic">"{quote}"</p>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {relatedExtractions.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="mb-10">
          <h2 className="font-display text-xl text-foreground mb-4">Signal Timeline</h2>
          <SignalTimeline extractions={relatedExtractions} />
        </motion.section>
      )}

      {influencedProjects.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-10">
          <h2 className="font-display text-xl text-foreground mb-4">Projects Influenced</h2>
          <div className="space-y-2">
            {influencedProjects.map(e => (
              <Link key={e.id} to={`/extraction/${e.id}`} className="block p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-border transition-all">
                <p className="text-sm font-medium text-foreground">{e.outcome?.asset_title || e.title}</p>
                <p className="text-xs text-muted-foreground">{e.outcome?.status}</p>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {relatedSignals.length > 0 && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mb-10">
          <h2 className="font-display text-xl text-foreground mb-4">Related Signals</h2>
          <div className="space-y-2">
            {relatedSignals.map(s => (
              <Link key={s.id} to={`/signal/${s.id}`} className="block p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-border transition-all">
                <p className="text-sm font-medium text-foreground">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.summary}</p>
              </Link>
            ))}
          </div>
        </motion.section>
      )}

      {signal.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {signal.tags.map(tag => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      <MergeSignalModal signal={signal} allSignals={allSignals} open={showMerge} onOpenChange={setShowMerge} />
    </div>
  );
}