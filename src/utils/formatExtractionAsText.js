export function formatExtractionAsText(extraction, penfires = []) {
  const lines = [];

  // ── Source Metadata ──────────────────────────────────────────────
  lines.push("════════════════════════════════════════");
  lines.push("SIGNALWRITER EXTRACTION");
  lines.push("════════════════════════════════════════");
  lines.push("");
  lines.push(`Title:         ${extraction.title}`);
  if (extraction.source_platform) {
    lines.push(`Source:        ${extraction.source_platform}`);
  }
  if (extraction.source_thread_title) {
    lines.push(`Thread:        "${extraction.source_thread_title}"`);
  }
  if (extraction.source_original_date) {
    lines.push(`Original Date: ${new Date(extraction.source_original_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  }
  if (extraction.created_date) {
    lines.push(`Extracted:     ${new Date(extraction.created_date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`);
  }
  if (extraction.source_text) {
    const wordCount = extraction.source_text.trim().split(/\s+/).filter(Boolean).length;
    lines.push(`Word Count:    ${wordCount.toLocaleString()} words`);
  }
  if (extraction.source_type) {
    lines.push(`Source Type:   ${extraction.source_type.replace(/_/g, " ")}`);
  }
  if (extraction.source_link) {
    lines.push(`Link:          ${extraction.source_link}`);
  }
  lines.push("");

  // ── Core Insight ─────────────────────────────────────────────────
  if (extraction.core_insight) {
    lines.push("── CORE INSIGHT ─────────────────────────");
    lines.push(extraction.core_insight);
    lines.push("");
  }

  // ── Thought Seeds ────────────────────────────────────────────────
  if (extraction.thought_seeds?.length) {
    lines.push("── THOUGHT SEEDS ────────────────────────");
    extraction.thought_seeds.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.content}`);
      if (s.context) lines.push(`   Context: ${s.context}`);
    });
    lines.push("");
  }

  // ── Framework Seeds ──────────────────────────────────────────────
  if (extraction.framework_seeds?.length) {
    lines.push("── FRAMEWORK SEEDS ──────────────────────");
    extraction.framework_seeds.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.name}`);
      if (s.description) lines.push(`   ${s.description}`);
    });
    lines.push("");
  }

  // ── Story Seeds ──────────────────────────────────────────────────
  if (extraction.story_seeds?.length) {
    lines.push("── STORY SEEDS ──────────────────────────");
    extraction.story_seeds.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.premise}`);
      if (s.elements) lines.push(`   Elements: ${s.elements}`);
    });
    lines.push("");
  }

  // ── Project Implications ─────────────────────────────────────────
  if (extraction.project_implications?.length) {
    lines.push("── PROJECT IMPLICATIONS ─────────────────");
    extraction.project_implications.forEach((s, i) => {
      lines.push(`${i + 1}. ${s.idea}`);
      if (s.domain) lines.push(`   Domain: ${s.domain}`);
    });
    lines.push("");
  }

  // ── Quotable Lines ───────────────────────────────────────────────
  if (extraction.quotable_lines?.length) {
    lines.push("── QUOTABLE LINES ───────────────────────");
    extraction.quotable_lines.forEach(q => lines.push(`"${q}"`));
    lines.push("");
  }

  // ── Emerging Patterns ────────────────────────────────────────────
  if (extraction.emerging_patterns?.length) {
    lines.push("── EMERGING PATTERNS ────────────────────");
    extraction.emerging_patterns.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
    lines.push("");
  }

  // ── Open Loops ───────────────────────────────────────────────────
  if (extraction.open_loops?.length) {
    lines.push("── OPEN LOOPS ───────────────────────────");
    extraction.open_loops.forEach((l, i) => {
      lines.push(`${i + 1}. ${l.question}`);
      if (l.context) lines.push(`   Context: ${l.context}`);
    });
    lines.push("");
  }

  // ── Tags ─────────────────────────────────────────────────────────
  if (extraction.suggested_tags?.length) {
    lines.push("── TAGS ─────────────────────────────────");
    lines.push(extraction.suggested_tags.join(", "));
    lines.push("");
  }

  // ── Penfires ─────────────────────────────────────────────────────
  if (penfires?.length) {
    lines.push("── PENFIRES ─────────────────────────────");
    penfires.forEach((p, i) => {
      lines.push(`${i + 1}. ${p.name} (${p.status})`);
      if (p.description) lines.push(`   ${p.description}`);
      if (p.occurrence_count) lines.push(`   Appearances: ${p.occurrence_count}`);
    });
    lines.push("");
  }

  // ── MIRA Note ────────────────────────────────────────────────────
  if (extraction.mira_note) {
    lines.push("── MIRA NOTE ────────────────────────────");
    lines.push(extraction.mira_note);
    lines.push("");
  }

  lines.push("════════════════════════════════════════");
  lines.push("Extracted with SignalWriter");
  lines.push("════════════════════════════════════════");

  return lines.join("\n");
}