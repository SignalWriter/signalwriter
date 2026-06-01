import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, StickyNote } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

function generateId() {
  return Math.random().toString(36).slice(2, 10);
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
      const newNote = {
        id: generateId(),
        content: input.trim(),
        created_at: new Date().toISOString(),
      };
      await updateNotes([...(extraction.notes || []), newNote]);
    },
    onSuccess: () => setInput(""),
  });

  const deleteMutation = useMutation({
    mutationFn: async (noteId) => {
      const updated = (extraction.notes || []).filter((n) => n.id !== noteId);
      await updateNotes(updated);
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const updated = (extraction.notes || []).map((n) =>
        n.id === editingId ? { ...n, content: editContent.trim() } : n
      );
      await updateNotes(updated);
    },
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
    },
  });

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey) && input.trim()) {
      addMutation.mutate();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 rounded-full bg-primary/60" />
        <span className="text-[10px] uppercase tracking-[0.15em] font-medium text-muted-foreground">
          Notes
        </span>
        {notes.length > 0 && (
          <span className="text-[10px] text-muted-foreground/40">{notes.length}</span>
        )}
      </div>

      {/* Timeline */}
      <AnimatePresence initial={false}>
        {notes.length > 0 && (
          <div className="relative space-y-2 pl-4 border-l border-border/30">
            {notes.map((note) => (
              <motion.div
                key={note.id}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                className="group relative"
              >
                <div className="absolute -left-[1.35rem] top-2 w-1.5 h-1.5 rounded-full bg-border group-hover:bg-primary/50 transition-colors" />

                {editingId === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      autoFocus
                      className="text-sm bg-muted/30 border-border/40 resize-none min-h-[60px]"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => saveMutation.mutate()}
                        disabled={!editContent.trim() || saveMutation.isPending}
                        className="h-7 text-xs px-3"
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => { setEditingId(null); setEditContent(""); }}
                        className="h-7 text-xs px-3 text-muted-foreground"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg px-3 py-2.5 bg-muted/20 border border-border/20 hover:border-border/40 transition-colors">
                    <p
                      className="text-sm text-foreground/85 leading-relaxed cursor-pointer"
                      onClick={() => { setEditingId(note.id); setEditContent(note.content); }}
                    >
                      {note.content}
                    </p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-muted-foreground/40">
                        {format(new Date(note.created_at), "MMM d, yyyy · h:mm a")}
                      </span>
                      <button
                        onClick={() => deleteMutation.mutate(note.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground/40 hover:text-destructive"
                      >
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

      {/* Add note */}
      <div className="space-y-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a note — a connection, intention, or observation..."
          className="text-sm bg-card/50 border-border/50 focus:border-primary/40 resize-none min-h-[72px] leading-relaxed"
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/30">⌘↵ to save</span>
          <Button
            size="sm"
            onClick={() => addMutation.mutate()}
            disabled={!input.trim() || addMutation.isPending}
            variant="outline"
            className="gap-1.5 h-7 text-xs px-3"
          >
            <Plus className="w-3 h-3" />
            Add Note
          </Button>
        </div>
      </div>
    </div>
  );
}