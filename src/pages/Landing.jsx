import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useState } from "react";
import { ArrowRight, Sparkles, BookOpen, Layers, TrendingUp, GitBranch, Target, Archive } from "lucide-react";

const features = [
  { icon: Sparkles, label: "Key Insights", desc: "The core ideas worth keeping" },
  { icon: BookOpen, label: "Story Ideas", desc: "Narrative seeds ready to develop" },
  { icon: Layers, label: "Frameworks", desc: "Mental models that emerged" },
  { icon: Target, label: "Project Opportunities", desc: "What could become something real" },
  { icon: TrendingUp, label: "Recurring Themes", desc: "Patterns that keep returning" },
  { icon: GitBranch, label: "Development Signals", desc: "What wants to become what" },
  { icon: Archive, label: "Mission-Aligned Next Steps", desc: "Where to go from here" },
];

const useCases = [
  "Find forgotten breakthroughs",
  "Track recurring patterns",
  "Connect ideas across conversations",
  "Develop discoveries into finished work",
  "Preserve what mattered before it gets lost",
];

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <p className="text-primary font-medium text-sm">You're on the list.</p>
        <p className="text-muted-foreground text-xs mt-1">We'll be in touch when SignalWriter opens up.</p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 px-4 py-3 rounded-xl bg-card border border-border/50 text-foreground placeholder:text-muted-foreground/50 text-sm focus:outline-none focus:border-primary/50 transition-colors"
      />
      <button
        type="submit"
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors whitespace-nowrap"
      >
        Join the Waitlist
        <ArrowRight className="w-4 h-4" />
      </button>
    </form>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body overflow-x-hidden">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="font-display text-lg text-foreground">SignalWriter</span>
        </div>
        <Link
          to="/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Sign in →
        </Link>
      </nav>

      {/* Hero */}
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/25 bg-primary/8 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] text-primary font-medium uppercase tracking-widest">Coming Soon</span>
          </div>

          <h1 className="font-display text-4xl md:text-6xl text-foreground leading-tight mb-6">
            Remember where you buried<br />
            <span className="text-primary italic">the good stuff.</span>
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-4">
            You know that conversation. The one that sparked three story ideas, six social posts, a product breakthrough, and your theory of everything.
          </p>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            You bookmarked it. You starred it. You told yourself you'd come back.<br />
            Then a hundred more conversations happened. Now it's gone.
          </p>

          <WaitlistForm />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16"
        >
          <img
            src="https://media.base44.com/images/public/6a1cbdf2b03ac232db82850b/7411fc7eb_CCO_Squirrel.png"
            alt="Chief Continuity Officer — the squirrel who knows your pain"
            className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl shadow-black/40"
          />
        </motion.div>
      </section>

      {/* Divider quote */}
      <section className="border-y border-border/25 py-12 px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-2xl md:text-3xl text-foreground/70 text-center max-w-3xl mx-auto italic"
        >
          "The most valuable thing in a conversation is often not the answer.<br />
          <span className="text-foreground">It's the path that led there."</span>
        </motion.p>
      </section>

      {/* What it extracts */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl text-foreground mb-3">
            Paste a conversation. Get back what mattered.
          </h2>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto">
            AI chat, journal entry, brainstorming session, transcript — SignalWriter extracts the signal from the noise.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex items-start gap-3 p-4 rounded-xl border border-border/25 bg-card/40"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <f.icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{f.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Not just a note app */}
      <section className="border-t border-border/25 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl text-foreground mb-4">
              Not just another note app.
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              SignalWriter preserves <span className="text-foreground">context, provenance, and continuity</span> — so you can reconnect with not only what you discovered, but how you discovered it.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="space-y-2.5"
          >
            {useCases.map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-border/20 bg-card/30">
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <p className="text-sm text-foreground/80">{item}</p>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mt-10"
          >
            <img
              src="https://media.base44.com/images/public/6a1cbdf2b03ac232db82850b/1f9fa95d5_CCOSquirrel2.png"
              alt="SignalWriter archive — the squirrel investigating the good stuff"
              className="w-full rounded-2xl shadow-2xl shadow-black/40"
            />
          </motion.div>
        </div>
      </section>

      {/* Built for */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl text-foreground mb-4">
              Built for people whose ideas have ideas.
            </h2>
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              Whether you're writing books, building products, exploring theories, researching, journaling, or collaborating with AI — SignalWriter is the continuity layer between your thinking and your creating.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="mt-10"
            >
              <img
                src="https://media.base44.com/images/public/6a1cbdf2b03ac232db82850b/38061b1d1_CCOSquirrel3.png"
                alt="Built for people whose ideas have ideas"
                className="w-full rounded-2xl shadow-2xl shadow-black/40"
              />
            </motion.div>

            <div className="mt-8 p-6 rounded-2xl border border-primary/15 bg-primary/5">
              <p className="font-display text-xl text-foreground mb-2">
                The world has plenty of tools for generating ideas.
              </p>
              <p className="text-muted-foreground">
                SignalWriter helps you <span className="text-foreground italic">remember where you put them.</span>
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/25 py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-4">
              Your problem isn't coming up<br />with good ideas.
            </h2>
            <p className="text-muted-foreground text-lg mb-3 italic">
              Your problem is remembering where you buried the damn things.
            </p>
            <p className="text-muted-foreground text-sm mb-10">
              Join the waitlist and help shape the continuity layer for AI-assisted creativity.
            </p>
            <WaitlistForm />
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/25 py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground/40">
          © 2026 SignalWriter. All rights reserved.
        </p>
      </footer>
    </div>
  );
}