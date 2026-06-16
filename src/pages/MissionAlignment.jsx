import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, CheckCircle2, Circle, ChevronRight, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

const SECTIONS = [
  {
    key: "immediate_goals",
    title: "My Immediate Goal",
    subtitle: "What are you trying to accomplish right now?",
    multi: true,
    options: [
      "Publish articles", "Publish stories", "Write a book", "Build a product",
      "Launch a business", "Grow an audience", "Develop a personal framework",
      "Organize my thinking", "Preserve important discoveries",
      "Finish what I've already started", "Other"
    ]
  },
  {
    key: "biggest_frustrations",
    title: "My Biggest Frustration",
    subtitle: "What gets in the way?",
    multi: true,
    options: [
      "I have too many ideas", "I keep losing ideas", "I don't know what to work on next",
      "My projects are scattered everywhere", "I start things but don't finish them",
      "I can't find old conversations when I need them", "My best insights are buried",
      "My ideas connect but I can't see how", "Yes. All of this."
    ]
  },
  {
    key: "progress_in_30_days",
    title: "What Would Feel Like Progress In The Next 30 Days?",
    subtitle: "What would make this month feel like a win?",
    multi: true,
    options: [
      "Publish something", "Finish something", "Launch something",
      "Clarify something", "Organize something", "Build momentum", "Reduce overwhelm"
    ]
  },
  {
    key: "mira_priorities",
    title: "What Should MIRA Prioritize?",
    subtitle: "Guide MIRA's attention toward what matters most.",
    multi: true,
    options: [
      "Quick wins", "Long-term projects", "Creative work", "Business opportunities",
      "Writing projects", "Research and exploration",
      "Forgotten discoveries worth revisiting", "High-probability completions"
    ]
  },
  {
    key: "energy_sources",
    title: "What Gives Me Energy?",
    subtitle: "MIRA will lean toward work that fuels you.",
    multi: true,
    options: [
      "Publishing", "Building", "Storytelling", "Researching", "Teaching",
      "Exploring ideas", "Connecting ideas", "Finishing things",
      "Helping others", "Learning new things", "Discovering patterns",
      "Creating something that didn't exist before"
    ]
  },
  {
    key: "self_descriptions",
    title: "What Sounds Most Like You?",
    subtitle: "Select everything that resonates.",
    multi: true,
    options: [
      "I have more ideas than time.",
      "I know I have something important buried somewhere.",
      "I keep circling the same themes.",
      "My conversations are more valuable than my notes.",
      "I need help deciding what deserves attention.",
      "I need help finishing what I start.",
      "My ideas have ideas.",
      "Yes. That one."
    ]
  }
];

function OptionButton({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm text-left transition-all duration-150 w-full",
        selected
          ? "border-primary/50 bg-primary/10 text-foreground"
          : "border-border/40 bg-card/40 text-muted-foreground hover:border-border/70 hover:text-foreground hover:bg-muted/30"
      )}
    >
      {selected
        ? <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
        : <Circle className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
      }
      {label}
    </button>
  );
}

export default function MissionAlignment() {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    immediate_goals: [],
    biggest_frustrations: [],
    progress_in_30_days: [],
    mira_priorities: [],
    energy_sources: [],
    self_descriptions: [],
    mission_statement: ""
  });
  const [saved, setSaved] = useState(false);

  const { data: existing, isLoading } = useQuery({
    queryKey: ["mission-alignment"],
    queryFn: async () => {
      const list = await base44.entities.MissionAlignment.list("-created_date", 1);
      return list[0] || null;
    },
    onSuccess: (data) => {
      if (data) {
        setForm({
          immediate_goals: data.immediate_goals || [],
          biggest_frustrations: data.biggest_frustrations || [],
          progress_in_30_days: data.progress_in_30_days || [],
          mira_priorities: data.mira_priorities || [],
          energy_sources: data.energy_sources || [],
          self_descriptions: data.self_descriptions || [],
          mission_statement: data.mission_statement || ""
        });
      }
    }
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (existing?.id) {
        await base44.entities.MissionAlignment.update(existing.id, form);
      } else {
        await base44.entities.MissionAlignment.create(form);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mission-alignment"] });
      setSaved(true);
    }
  });

  const toggle = (key, value) => {
    setForm(prev => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
      };
    });
  };

  const isLastStep = step === SECTIONS.length;
  const section = SECTIONS[step];
  const totalSteps = SECTIONS.length + 1; // +1 for mission statement

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (saved) {
    return (
      <div className="max-w-xl mx-auto px-6 py-20 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-display text-3xl text-foreground mb-3">MIRA is aligned.</h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-8">
            Your mission context has been saved. MIRA will now use this to guide what it surfaces, prioritizes, and recommends across your workspace.
          </p>
          <Button onClick={() => { setSaved(false); setStep(0); }} variant="outline" size="sm" className="mr-3">
            Edit Alignment
          </Button>
          <Button onClick={() => window.history.back()}>
            Back to Workspace
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 md:py-14">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary font-medium">Mission Alignment</span>
        </div>
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">Help MIRA understand what matters most right now.</h1>

        {/* Progress bar */}
        <div className="mt-6 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-muted/50 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((step) / (totalSteps - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground/50 font-mono flex-shrink-0">
            {step + 1} / {totalSteps}
          </span>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {!isLastStep ? (
            <div>
              <h2 className="font-display text-xl text-foreground mb-1">{section.title}</h2>
              <p className="text-sm text-muted-foreground mb-6">{section.subtitle}</p>
              <div className="space-y-2">
                {section.options.map(opt => (
                  <OptionButton
                    key={opt}
                    label={opt}
                    selected={(form[section.key] || []).includes(opt)}
                    onClick={() => toggle(section.key, opt)}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="font-display text-xl text-foreground mb-1">Mission Statement</h2>
              <p className="text-sm text-muted-foreground mb-6">What are you trying to accomplish right now? Optional — but powerful.</p>
              <Textarea
                value={form.mission_statement}
                onChange={e => setForm(prev => ({ ...prev, mission_statement: e.target.value }))}
                placeholder="I'm trying to..."
                className="text-sm bg-card/50 border-border/50 focus:border-primary/40 resize-none min-h-[140px] leading-relaxed"
              />
              <div className="mt-6 p-4 rounded-xl bg-muted/20 border border-border/20">
                <p className="text-[11px] text-muted-foreground/70 leading-relaxed italic">
                  Mission Alignment is not about productivity. It is about helping MIRA understand what matters to you, what you're trying to build, what gives you energy, and what success looks like right now — so SignalWriter can answer not just "What could I do next?" but "What <em>should</em> I do next?"
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setStep(s => s - 1)}
          disabled={step === 0}
          className="gap-1.5 text-muted-foreground"
        >
          <ChevronLeft className="w-4 h-4" />
          Back
        </Button>

        {!isLastStep ? (
          <Button onClick={() => setStep(s => s + 1)} className="gap-1.5">
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            {saveMutation.isPending ? "Saving…" : "Align MIRA"}
          </Button>
        )}
      </div>
    </div>
  );
}