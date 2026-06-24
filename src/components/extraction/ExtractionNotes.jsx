import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QUILL_MODULES = {
  toolbar: [
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["blockquote"],
    ["clean"],
  ],
};

const QUILL_FORMATS = ["bold", "italic", "underline", "list", "bullet", "blockquote"];

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function isEmptyHtml(html) {
  return !html || html.replace(/<(.|\n)*?>/g, "").trim() === "";
}

export default function ExtractionNotes({ extraction }) {
  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const queryClient = useQueryClient();

  const notes = [...(extraction.notes || [])].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const updateNotes = async (updatedNotes) => {
    await base44.entities.Extraction.update(extraction.id, { notes: updatedNotes });
    queryClient.invalidateQueries({ queryKey: ["extraction", extraction.id] });
  };

  const addMutation = useMutation({
    mutationFn: async () => {
      const newNote = { id: generateId(), content: input.trim(), created_at: new Date().toISOString() };
      await updateNotes([...(extraction.notes || []), newNote]);
    },
    onSuccess: () => setInput(""),
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId) => {
      await updateNotes((extraction.notes || []).filter((n) => n.id !== noteId));
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updated = (extraction.notes || []).map((n) =>
        n.id === editingId ? { ...n, content: editContent.trim() } : n
      );
      await updateNotes(updated);
    },
    onSuccess: () => { setEditingId(null); setEditContent(""); },
  });

  return (
    <div className="space-y-4">
      <style>{`
        .notes-quill .ql-toolbar { background: hsl(var(--muted)/0.4); border-color: hsl(var(--border)/0.4) !important; border-radius: 0.5rem 0.5rem 0 0; padding: 6px 8px; }
        .notes-quill .ql-container { background: hsl(var(--card)/0.5); border-color: hsl(var(--border)/0.5) !important; border-radius: 0 0 0.5rem 0.5rem; min-height: 80px; }
        .notes-quill .ql-editor { font-size: 0.875rem; line-height: 1.6; color: hsl(var(--foreground)); }
        .notes-quill .ql-editor.ql-blank::before { color: hsl(var(--muted-foreground)/0.5); font-style: normal; }
        .notes-quill .ql-stroke { stroke: hsl(var(--muted-foreground)) !important; }
        .notes-quill .ql-fill { fill: hsl(var(--muted-foreground)) !important; }
        .notes-quill .ql-picker { color: hsl(var(--muted-foreground)) !important; }
        .notes-quill button:hover .ql-stroke, .notes-quill button.ql-active .ql-stroke { stroke: hsl(var(--primary)) !important; }
        .note-content p { margin-bottom: 0.35em; } .note-content ul, .note-content ol { padding-left: 1.25em; margin-bottom: 0.35em; } .note-content blockquote { border-left: 3px solid hsl(var(--primary)/0.4); padding-left: 0.75em; color: hsl(var(--muted-foreground)); margin: 0.35em 0; }
      `}</style>

      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">Notes</span>
        {notes.length > 0 && <span className="text-[10px] text-muted-foreground/40">{notes.length}</span>}
      </div>

      <AnimatePresence initial={false}>
        {notes.length > 0 && (
          <div className="relative space-y-2 pl-4 border-l border-border/30">
            {notes.map((note) => (
              <motion.div key={note.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} className="group relative">
                <div className="absolute -left-[1.35rem] top-2 w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />

                {editingId === note.id ? (
                  <div className="space-y-2">
                    <div className="notes-quill">
                      <ReactQuill
                        value={editContent}
                        onChange={setEditContent}
                        modules={QUILL_MODULES}
                        formats={QUILL_FORMATS}
                        theme="snow"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveMutation.mutate()} disabled={isEmptyHtml(editContent) || saveMutation.isPending} className="h-7 text-xs px-3">Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setEditingId(null); setEditContent(""); }} className="h-7 text-xs px-3 text-muted-foreground">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg px-3 py-2.5 bg-muted/20 border border-border/20 hover:border-border/40 transition-colors cursor-pointer" onClick={() => { setEditingId(note.id); setEditContent(note.content); }}>
                    <div className="note-content text-sm text-foreground/85 leading-relaxed" dangerouslySetInnerHTML={{ __html: note.content }} />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground/40">{format(new Date(note.created_at), "MMM d, yyyy · h:mm a")}</span>
                      <button onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(note.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="space-y-2">
        <div className="notes-quill">
          <ReactQuill
            value={input}
            onChange={setInput}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            theme="snow"
            placeholder="Add a note — a connection, intention, or observation..."
          />
        </div>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => addMutation.mutate()} disabled={isEmptyHtml(input) || addMutation.isPending} variant="outline" className="gap-1.5 h-7 text-xs px-3">
            <Plus className="w-3 h-3" /> Add Note
          </Button>
        </div>
      </div>
    </div>
  );
}