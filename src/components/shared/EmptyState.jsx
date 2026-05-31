import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center px-6"
    >
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-5 border border-border/30">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </motion.div>
  );
}