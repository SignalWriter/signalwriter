export function formatExtractionAsText(extraction) {
  const lines = [];

  lines.push(`# ${extraction.title}`);
  lines.push(`Date: ${new Date(extraction.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  if (extraction.source_type) {
    lines.push(`Source: ${extraction.source_type.replace(/_/g, " ")}`);
  }
  lines.push("");

  if (extraction.core_insight) {
    lines.push("## Core Insight");
    lines.push(extraction.core_insight);
    lines.push("");
  }

  if (extraction.thought_seeds?.length) {
    lines.push("## Thought Seeds");
    extraction.thought_seeds.forEach(s => {
      lines.push(`- ${s.content}`);
      if (s.context) lines.push(`  Context: ${s.context}`);
    });
    lines.push("");
  }

  if (extraction.framework_seeds?.length) {
    lines.push("## Framework Seeds");
    extraction.framework_seeds.forEach(s => {
      lines.push(`- ${s.name}: ${s.description}`);
    });
    lines.push("");
  }

  if (extraction.story_seeds?.length) {
    lines.push("## Story Seeds");
    extraction.story_seeds.forEach(s => {
      lines.push(`- ${s.premise}`);
      if (s.elements) lines.push(`  Elements: ${s.elements}`);
    });
    lines.push("");
  }

  if (extraction.project_implications?.length) {
    lines.push("## Project Implications");
    extraction.project_implications.forEach(s => {
      lines.push(`- ${s.idea}`);
      if (s.domain) lines.push(`  Domain: ${s.domain}`);
    });
    lines.push("");
  }

  if (extraction.quotable_lines?.length) {
    lines.push("## Quotable Lines");
    extraction.quotable_lines.forEach(q => lines.push(`"${q}"`));
    lines.push("");
  }

  if (extraction.emerging_patterns?.length) {
    lines.push("## Emerging Patterns");
    extraction.emerging_patterns.forEach(p => lines.push(`- ${p}`));
    lines.push("");
  }

  if (extraction.open_loops?.length) {
    lines.push("## Open Loops");
    extraction.open_loops.forEach(l => {
      lines.push(`- ${l.question}`);
      if (l.context) lines.push(`  Context: ${l.context}`);
    });
    lines.push("");
  }

  if (extraction.suggested_tags?.length) {
    lines.push(`Tags: ${extraction.suggested_tags.join(", ")}`);
    lines.push("");
  }

  if (extraction.mira_note) {
    lines.push("## MIRA Note");
    lines.push(extraction.mira_note);
    lines.push("");
  }

  return lines.join("\n");
}