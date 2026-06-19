import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, BookOpen, Target, FileText, Lightbulb, Archive, GitMerge, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";

const actions = [
  { key: "framework", label: "Create Framework", icon: BookOpen },
  { key: "mission", label: "Create Mission", icon: Target },
  { key: "article", label: "Create Article", icon: FileText },
  { key: "story", label: "Create Story Concept", icon: Lightbulb },
];

function buildPrompt(key, signal) {
  const base = `Based on this Emerging Signal:\n\nSignal: "${signal.name}"\nSummary: ${signal.summary}\nKey Quotes:\n${(signal.key_quotes || []).map(q => `- "${q}"`).join("\n")}\nTags: ${(signal.tags || []).join(", ")}`;

  const prompts = {
    framework: `${base}\n\nCreate a conceptual framework based on this signal. Include:\n- Framework name\n- Core thesis\n- Key principles (3-5)\n- How to apply it\n- Related concepts\n\nWrite in a clear, authoritative style.`,
    mission: `${base}\n\nCraft a mission statement inspired by this signal. Include:\n- Mission statement (1-2 sentences)\n- Why this matters\n- Core values it reflects\n- How to embody it daily\n\nWrite in an inspiring, personal tone.`,
    article: `${base}\n\nCreate an article outline based on this signal. Include:\n- Title options (3)\n- Hook/opening paragraph\n- Key sections with brief descriptions\n- Closing thesis\n- Target audience\n\nWrite in a professional, engaging style.`,
    story: `${base}\n\nDevelop a story concept inspired by this signal. Include:\n- Story premise\n- Central conflict\n- Key characters or archetypes\n- Setting\n- Thematic elements\n- Opening scene sketch\n\nWrite in a creative, evocative style.`,
  };
  return prompts[key] || base;
}

export default function SignalActions({ signal, onArchive, onMerge }) {
  const [generating, setGenerating] = useState(null);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const [copied, setCopied] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const queryClient = useQueryClient();

  const handleGenerate = async (action) => {
    setGenerating(action.key);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: buildPrompt(action.key, signal),
        model: "claude_sonnet_4_6",
      });
      setGeneratedContent({ title: action.label, content: result });
      setShowDialog(true);
    } finally {
      setGenerating(null);
    }
  };

  const handleArchive = async () => {
    setArchiving(true);
    try {
      await base44.entities.Signal.update(signal.id, { status: "archived" });
      queryClient.invalidateQueries({ queryKey: ["signals"] });
      queryClient.invalidateQueries({ queryKey: ["signals-preview"] });
      onArchive?.();
    } finally {
      setArchiving(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedContent?.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map(action => (
          <Button
            key={action.key}
            variant="outline"
            size="sm"
            onClick={() => handleGenerate(action)}
            disabled={!!generating}
            className="gap-2 text-xs"
          >
            {generating === action.key ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <action.icon className="w-3.5 h-3.5" />
            )}
            {action.label}
          </Button>
        ))}
        <Button variant="outline" size="sm" onClick={onMerge} className="gap-2 text-xs">
          <GitMerge className="w-3.5 h-3.5" />
          Merge
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleArchive}
          disabled={archiving}
          className="gap-2 text-xs text-muted-foreground"
        >
          {archiving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
          Archive
        </Button>
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{generatedContent?.title}</DialogTitle>
          </DialogHeader>
          <div className="prose prose-sm prose-invert max-w-none">
            <ReactMarkdown>{generatedContent?.content || ""}</ReactMarkdown>
          </div>
          <div className="flex justify-end mt-4">
            <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2">
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}