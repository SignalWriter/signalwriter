import { motion } from "framer-motion";
import { Flame, TrendingUp, Moon, Activity } from "lucide-react";
import { getMomentum } from "./MomentumBadge";

export default function PenfireSummaryBar({ penfires }) {
  const total = penfires.length;
  const dormant = penfires.filter(p => getMomentum(p) === "dormant").length;
  const active = total - dormant;
  const fastest = penfires
    .filter(p => getMomentum(p) === "gaining")
    .sort((a, b) => (b.occurrence_count || 1) - (a.occurrence_count || 1))[0];

  const stats = [
    { label: "Total Penfires", value: total, icon: Flame, color: "text-primary" },
    { label: "Active", value: active, icon: Activity, color: "text-emerald-400" },
    { label: "Fastest Growing", value: fastest?.name || "—", icon: TrendingUp, color: "text-amber-400", small: true },
    { label: "Dormant", value: dormant, icon: Moon, color: "text-muted-foreground" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10"
    >
      {stats.map(({ label, value, icon: Icon, color, small }) => (
        <div key={label} className="rounded-xl border border-border/40 bg-card/60 px-4 py-3">
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`w-3.5 h-3.5 ${color}`} />
            <span className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</span>
          </div>
          <p className={`font-display ${small ? "text-base" : "text-2xl"} text-foreground leading-tight`}>
            {value}
          </p>
        </div>
      ))}
    </motion.div>
  );
}