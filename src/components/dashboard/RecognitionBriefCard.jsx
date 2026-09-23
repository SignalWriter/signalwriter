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

const brief = {
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

export default function RecognitionBriefCard() {
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
                Static v0
              </span>
            </div>
            <h2 className="font-display text-xl text-foreground md:text-2xl">The human is no longer where institutions point</h2>
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
