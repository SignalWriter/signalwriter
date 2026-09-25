import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Eye,
  Layers,
  PenLine,
  Sparkles,
  Wrench,
} from "lucide-react";

const staticBrief = {
  headline: "The human is no longer where institutions point",
  date: "Sep 23, 2026",
  confidence: "High",
  strongestSignal: "Institutional Authority Loses the Human",
  whyItMatters:
    "AI writing panic, detector false positives, and audience recognition patterns are pointing at the same pressure: institutions are losing credibility as arbiters of what counts as human, authentic, educated, moral, or true.",
  writingMove: {
    title: "Draft the institutional prose essay",
    description:
      "Lead with: AI did not learn to write like humans. It learned to write like institutions. Pair it with the emotional hook: the better you write, the more suspicious you look.",
  },
  productMove: {
    title: "Make process the provenance",
    description:
      "Use emergence trace and conversation history as SignalWriter's answer to brittle output judgments and authenticity theater.",
  },
  openQuestion:
    "Should the next version generate this card from live Signals and Penfires, or keep one more static/manual pass while the shape proves itself?",
  sources: ["Aftermath analyses", "SignalWriter signals", "Penfire momentum", "Mission alignment"],
  actions: [
    {
      group: "Create",
      title: "Draft Essay Seed",
      description: "Turn the strongest signal into a Substack/Medium opening and outline.",
      confidence: "High",
      to: "/extract",
      cta: "Draft",
    },
    {
      group: "Connect",
      title: "Update Penfire",
      description: "Tie institutional prose, craft suspicion, and recognition into one recurring theme.",
      confidence: "High",
      to: "/penfires",
      cta: "Review",
    },
    {
      group: "Prepare",
      title: "Build Context Bundle",
      description: "Package the brief, source signals, promotion rules, and action model for implementation work.",
      confidence: "Medium",
      to: "/bundles",
      cta: "Bundle",
    },
  ],
};

const groupStyles = {
  Create: "border-emerald-400/20 bg-emerald-400/5 text-emerald-300",
  Connect: "border-blue-400/20 bg-blue-400/5 text-blue-300",
  Prepare: "border-amber-400/20 bg-amber-400/5 text-amber-300",
};

function signalScore(signal) {
  const trendWeight = signal.trend === "growing" ? 3 : signal.trend === "stable" ? 2 : 1;
  const quotes = (signal.key_quotes || []).length;
  const related = (signal.related_extraction_ids || []).length;
  const tags = (signal.tags || []).length;
  return trendWeight * 10 + quotes * 2 + related * 3 + tags;
}

function extractionScore(extraction) {
  const seeds =
    (extraction.thought_seeds || []).length +
    (extraction.framework_seeds || []).length +
    (extraction.story_seeds || []).length;
  const implications = (extraction.project_implications || []).length;
  const quotes = (extraction.quotable_lines || []).length;
  const patterns = (extraction.emerging_patterns || []).length;
  const tags = (extraction.suggested_tags || []).length;
  const notes = (extraction.notes || []).length;
  const refs = (extraction.references || []).length;
  return seeds * 3 + implications * 2 + quotes * 2 + patterns * 2 + tags + notes + refs;
}

function topBy(arr, scoreFn) {
  if (!arr.length) return null;
  return arr.reduce((best, item) => (scoreFn(item) > scoreFn(best) ? item : best), arr[0]);
}

function buildLiveBrief(penfires, signals, extractions) {
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const sources = [];
  if (penfires.length) sources.push("Penfire momentum");
  if (signals.length) sources.push("SignalWriter signals");
  if (extractions.length) sources.push("Extraction archive");
  if (!sources.length) sources.push("Mission alignment");

  const recordCount = penfires.length + signals.length + extractions.length;
  const confidence = recordCount >= 5 ? "High" : recordCount >= 1 ? "Medium" : "Low";

  // Champion priority: Penfire (highest occurrence) -> Signal (highest score) -> Extraction (highest impact)
  let champion = null;
  const topPenfire = topBy(penfires, (p) => p.occurrence_count || 0);
  if (topPenfire) {
    champion = { type: "penfire", record: topPenfire };
  } else {
    const topSignal = topBy(signals, signalScore);
    if (topSignal) {
      champion = { type: "signal", record: topSignal };
    } else {
      const topExtraction = topBy(extractions, extractionScore);
      if (topExtraction) {
        champion = { type: "extraction", record: topExtraction };
      }
    }
  }

  let headline = "";
  let strongestSignal = "";
  let whyItMatters = "";
  let writingMove = { title: "", description: "" };
  let productMove = { title: "", description: "" };

  if (champion.type === "penfire") {
    const p = champion.record;
    headline = `Recurring pattern: ${p.name}`;
    strongestSignal = p.name;
    whyItMatters = p.description || `Recurring pattern detected across ${p.occurrence_count || 1} moments.`;
    writingMove = {
      title: `Write toward "${p.name}"`,
      description: p.description || "Pull the threads of this recurring pattern into a single piece.",
    };
    productMove = {
      title: "Reinforce this pattern",
      description: `"${p.name}" has surfaced ${p.occurrence_count || 1} times. Bundle the related extractions and track its momentum.`,
    };
  } else if (champion.type === "signal") {
    const s = champion.record;
    headline = `Emerging signal: ${s.name}`;
    strongestSignal = s.name;
    whyItMatters = s.summary || "A recurring signal across your archive.";
    writingMove = {
      title: `Develop the signal: ${s.name}`,
      description: s.summary || "Turn this signal into a focused piece with supporting quotes.",
    };
    productMove = {
      title: "Track and amplify this signal",
      description: `Trend: ${s.trend || "stable"}. ${(s.key_quotes || []).length} key quotes and ${(s.related_extraction_ids || []).length} linked extractions.`,
    };
  } else {
    const e = champion.record;
    headline = `Top extraction: ${e.title}`;
    strongestSignal = e.title;
    whyItMatters = e.core_insight || e.source_thread_title || "A high-impact extraction from your archive.";
    writingMove = {
      title: `Expand: ${e.title}`,
      description: e.core_insight || "Develop this extraction's core insight into a full piece.",
    };
    productMove = {
      title: "Bundle this extraction",
      description: `Package this extraction with its ${(e.thought_seeds || []).length} thought seeds and ${(e.framework_seeds || []).length} framework seeds.`,
    };
  }

  const topSignal = topBy(signals, signalScore);
  const topExtraction = topBy(extractions, extractionScore);

  const actions = [
    {
      group: "Create",
      title: "Draft from this signal",
      description: "Turn the strongest signal into a Substack/Medium opening and outline.",
      confidence,
      to: "/extract",
      cta: "Draft",
    },
    {
      group: "Connect",
      title: topSignal ? `Open signal: ${topSignal.name}` : "Explore signals",
      description: topSignal
        ? topSignal.summary || "Review this signal's momentum and linked extractions."
        : "See all emerging signals and their momentum.",
      confidence,
      to: topSignal ? `/signal/${topSignal.id}` : "/signals",
      cta: "Review",
    },
    {
      group: "Prepare",
      title: topExtraction ? `Open extraction: ${topExtraction.title}` : "Build Context Bundle",
      description: topExtraction
        ? topExtraction.core_insight || "Review this extraction and package it for implementation."
        : "Package the brief and sources for implementation work.",
      confidence: "Medium",
      to: topExtraction ? `/extraction/${topExtraction.id}` : "/bundles",
      cta: topExtraction ? "Open" : "Bundle",
    },
  ];

  return {
    headline,
    date: today,
    confidence,
    strongestSignal,
    whyItMatters,
    writingMove,
    productMove,
    openQuestion:
      "Which thread should become the next published piece, and which should stay in the archive to ripen?",
    sources,
    actions,
  };
}

function MoveCard({ icon: Icon, label, move }) {
  return (
    <div className="rounded-xl border border-border/35 bg-background/35 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      </div>
      <h3 className="mb-1 text-sm font-medium text-foreground">{move.title}</h3>
      <p className="text-xs leading-relaxed text-muted-foreground">{move.description}</p>
    </div>
  );
}

function ActionCard({ action }) {
  return (
    <Link
      to={action.to}
      className="group rounded-xl border border-border/35 bg-card/45 p-3 transition-all hover:border-primary/30 hover:bg-card"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${groupStyles[action.group] || "border-border bg-muted text-muted-foreground"}`}>
          {action.group}
        </span>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <CheckCircle2 className="h-3 w-3 text-primary/70" />
          {action.confidence}
        </div>
      </div>
      <p className="mb-1 text-sm font-medium text-foreground group-hover:text-primary">{action.title}</p>
      <p className="mb-3 text-xs leading-relaxed text-muted-foreground">{action.description}</p>
      <div className="flex items-center gap-1 text-xs font-medium text-primary">
        {action.cta}
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export default function RecognitionBriefCard({ signals = [], extractions = [], penfires = [], loading = false }) {
  const liveRecordsExist = signals.length > 0 || extractions.length > 0 || penfires.length > 0;
  const liveBrief = useMemo(
    () => (liveRecordsExist ? buildLiveBrief(penfires, signals, extractions) : null),
    [penfires, signals, extractions, liveRecordsExist]
  );
  const brief = liveRecordsExist && liveBrief ? liveBrief : staticBrief;
  const badgeText = loading ? "Reading feed" : liveRecordsExist ? "Live feed" : "Static v0";

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mt-8 overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card/70 to-card/40 p-5 shadow-sm md:p-6"
    >
      <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/12 text-primary">
            <Compass className="h-4 w-4" />
          </div>
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-primary">Recognition Brief</p>
              <span className="rounded-full border border-primary/20 bg-primary/8 px-2 py-0.5 text-[10px] text-primary/80">
                {badgeText}
              </span>
            </div>
            <h2 className="font-display text-xl text-foreground md:text-2xl">{brief.headline}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{brief.date} - {brief.confidence} confidence</p>
          </div>
        </div>
        <Link
          to="/signals"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border/40 bg-background/40 px-3 py-2 text-xs font-medium text-foreground transition-all hover:border-primary/30 hover:text-primary"
        >
          <Eye className="h-3.5 w-3.5" />
          View sources
        </Link>
      </div>

      <div className="mb-5 rounded-xl border border-primary/15 bg-primary/5 p-4">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-primary/80">Strongest Signal</p>
        </div>
        <h3 className="mb-2 text-base font-medium text-foreground">{brief.strongestSignal}</h3>
        <p className="text-sm leading-relaxed text-foreground/75">{brief.whyItMatters}</p>
      </div>

      <div className="mb-5 grid gap-3 md:grid-cols-2">
        <MoveCard icon={PenLine} label="Best Writing Move" move={brief.writingMove} />
        <MoveCard icon={Wrench} label="Best Product Move" move={brief.productMove} />
      </div>

      <div className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-4 w-4 text-primary" />
          <h3 className="font-display text-base text-foreground">Suggested Actions</h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {brief.actions.map((action) => (
            <ActionCard key={action.title} action={action} />
          ))}
        </div>
      </div>

      <div className="grid gap-3 border-t border-border/25 pt-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <p className="mb-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">Open Question</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{brief.openQuestion}</p>
        </div>
        <div className="flex flex-wrap gap-1.5 md:justify-end">
          {brief.sources.map((source) => (
            <span key={source} className="rounded-full border border-border/35 bg-background/35 px-2 py-1 text-[10px] text-muted-foreground">
              {source}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}