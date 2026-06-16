import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Archive, Trash2, ArchiveRestore, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function ConfirmDialog({ title, message, confirmLabel, confirmVariant = "default", onConfirm, onCancel, isLoading }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        className="w-full max-w-sm rounded-2xl border border-border/50 bg-card p-6 shadow-xl"
      >
        <div className="flex items-start gap-3 mb-4">
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
            confirmVariant === "destructive" ? "bg-destructive/10" : "bg-primary/10"
          )}>
            {confirmVariant === "destructive"
              ? <AlertTriangle className="w-4 h-4 text-destructive" />
              : <Archive className="w-4 h-4 text-primary" />
            }
          </div>
          <div>
            <h3 className="font-display text-lg text-foreground">{title}</h3>
            <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className={cn(confirmVariant === "destructive" && "bg-destructive hover:bg-destructive/90 text-destructive-foreground")}
          >
            {isLoading ? "Working…" : confirmLabel}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ArchiveDeleteActions({ extraction, onArchived, onDeleted, onRestored }) {
  const [dialog, setDialog] = useState(null); // "archive" | "delete" | "restore"
  const queryClient = useQueryClient();

  const archiveMutation = useMutation({
    mutationFn: () => base44.entities.Extraction.update(extraction.id, { status: "archived" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extractions"] });
      queryClient.invalidateQueries({ queryKey: ["extractions-workspace"] });
      queryClient.invalidateQueries({ queryKey: ["extraction", extraction.id] });
      setDialog(null);
      onArchived?.();
    }
  });

  const restoreMutation = useMutation({
    mutationFn: () => base44.entities.Extraction.update(extraction.id, { status: "active" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extractions"] });
      queryClient.invalidateQueries({ queryKey: ["extractions-workspace"] });
      queryClient.invalidateQueries({ queryKey: ["extraction", extraction.id] });
      setDialog(null);
      onRestored?.();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => base44.entities.Extraction.delete(extraction.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["extractions"] });
      queryClient.invalidateQueries({ queryKey: ["extractions-workspace"] });
      setDialog(null);
      onDeleted?.();
    }
  });

  const isArchived = extraction.status === "archived";
  const isPending = archiveMutation.isPending || deleteMutation.isPending || restoreMutation.isPending;

  return (
    <>
      <div className="flex items-center gap-1">
        {isArchived ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDialog("restore")}
            className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <ArchiveRestore className="w-3.5 h-3.5" />
            Restore
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDialog("archive")}
            className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <Archive className="w-3.5 h-3.5" />
            Archive
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDialog("delete")}
          className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </Button>
      </div>

      <AnimatePresence>
        {dialog === "archive" && (
          <ConfirmDialog
            title="Archive this extraction?"
            message="This will remove it from active views but preserve it for future reference. You can restore it at any time."
            confirmLabel="Archive"
            onConfirm={() => archiveMutation.mutate()}
            onCancel={() => setDialog(null)}
            isLoading={isPending}
          />
        )}
        {dialog === "restore" && (
          <ConfirmDialog
            title="Restore this extraction?"
            message="This will move it back to your active workspace."
            confirmLabel="Restore"
            onConfirm={() => restoreMutation.mutate()}
            onCancel={() => setDialog(null)}
            isLoading={isPending}
          />
        )}
        {dialog === "delete" && (
          <ConfirmDialog
            title="Delete this extraction permanently?"
            message="This action cannot be undone. All notes and data associated with this extraction will be lost. Consider archiving instead."
            confirmLabel="Delete Permanently"
            confirmVariant="destructive"
            onConfirm={() => deleteMutation.mutate()}
            onCancel={() => setDialog(null)}
            isLoading={isPending}
          />
        )}
      </AnimatePresence>
    </>
  );
}