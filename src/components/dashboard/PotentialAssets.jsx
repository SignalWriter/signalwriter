import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, FileText, Film, Package, Search, Mic, GraduationCap, ArrowRight, X, BookMarked, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const ASSET_TYPES = [
  { key: "Novel",            label: "Novels",            icon: BookMarked, color: "text-rose-400",   bg: "bg-rose-400/10",   border: "border-rose-400/20"   },
  { key: "Article",          label: "Articles",          icon: FileText,   color: "text-sky-400",    bg: "bg-sky-400/10",    border: "border-sky-400/20"    },
  { key: "Essay",            label: "Essays",            icon: BookOpen,   color: "text-amber-400",  bg: "bg-amber-400/10",  border: "border-amber-400/20"  },
  { key: "Video",            label: "Videos",            icon: Film,       color: "text-violet-400", bg: "bg-violet-400/10", border: "border-violet-400/20" },
  { key: "Product",          label: "Products",          icon: Package,    color: "text-emerald-400",bg: "bg-emerald-400/10",border: "border-emerald-400/20"},
  { key: "Research Thread",  label: "Research Threads",  icon: Search,     color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
  { key: "Presentation",     label: "Presentations",     icon: Mic,        color: "text-pink-400",   bg: "bg-pink-400/10",   border: "border-pink-400/20"   },
  { key: "Personal Reflection", label: "Frameworks",    icon: GraduationCap,color:"text-teal-400",   bg: "bg-teal-400/10",   border: "border-teal-400/20"   },
];

function scoreExtraction(e) {
  return (
    (e.thought_seeds?.length || 0) +
    (e.framework_seeds?.length || 0) +
    (e.story_seeds?.length || 0) +
    (e.project_implications?.length || 0) +
    (e.emerging_patterns?.length || 0)
  );
}

// Cluster extractions supporting a given form into "opportunities" (named groups or top extractions)
function buildOpportunities(extractions, formKey) {
  const relevant = extractions.filter(e =>
    (e.development_signals?.potential_forms || []).includes(formKey)
  );
  if (relevant.length === 0) return [];

  // Group by project_implication ideas / framework names / story seeds
  const projectMap = {};
  relevant.forEach(e => {
    const names = [
      ...(e.project_implications || []).map(p => p.idea || p.domain).filter(Boolean),
      ...(e.framework_seeds || []).map(f => f.name).filter(Boolean),
      ...(e.story_seeds || []).length > 0 ? [e.title] : [],
    ];

    const key = names[0] || e.title;
    if (!projectMap[key]) {
      projectMap[key] = { name: key, count: 0, extractionIds: [], themes: new Set(), tags: new Set(), lastDate: null };
    }
    projectMap[key].count++;
    projectMap[key].extractionIds.push(e.id);
    (e.emerging_patterns || []).forEach(p => projectMap[key].themes.add(p));
    (e.suggested_tags || []).forEach(t => projectMap[key].tags.add(t));
    const d = new Date(e.created_date);
    if (!projectMap[key].lastDate || d > projectMap[key].lastDate) projectMap[key].lastDate = d;
  });

  return Object.values(projectMap)
    .map(p => ({ ...p, themes: [...p.themes].slice(0, 3), tags: [...p.tags].slice(0, 3) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);
}

function OpportunityDrawer({ opportunity, extractions, assetType, onClose }) {
  const related = extractions.filter(e => opportunity.extractionIds.includes(e.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
          <div>
            <p className={`text-[10px] uppercase tracking-[0.2em] font-medium mb-0.5 ${assetType.color}`}>
              {assetType.label} · Opportunity View
            </p>
            <h3 className="font-display text-lg text-foreground">{opportunity.name}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-4 overflow-y-auto space-y-5">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Supporting Signals</p>
              <p className={`text-2xl font-display ${assetType.color}`}>{opportunity.count}</p>
            </div>
            {opportunity.lastDate && (
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Last Touched</p>
                <p className="text-sm text-foreground">{format(opportunity.lastDate, "MMM d, yyyy")}</p>
              </div>
            )}
          </div>

          {opportunity.themes.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Related Themes</p>
              <div className="flex flex-wrap gap-1.5">
                {opportunity.themes.map(t => (
                  <span key={t} className={`text-xs px-2.5 py-1 rounded-full ${assetType.bg} border ${assetType.border} ${assetType.color}`}>{t}</span>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground mb-2">Supporting Signals</p>
            <div className="space-y-2">
              {related.map(e => (
                <Link
                  key={e.id}
                  to={`/extraction/${e.id}`}
                  onClick={onClose}
                  className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border/30 bg-muted/20 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                >
                  <div className="min-w-0">
                    <p className="text-sm text-foreground font-medium group-hover:text-primary transition-colors truncate">{e.title}</p>
                    {e.core_insight && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{e.core_insight}</p>}
                    <p className="text-[10px] text-muted-foreground/50 mt-1 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {format(new Date(e.created_date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AssetDrawer({ assetType, extractions, onClose }) {
  const [activeOpportunity, setActiveOpportunity] = useState(null);
  const opportunities = useMemo(() => buildOpportunities(extractions, assetType.key), [extractions, assetType.key]);
  const directCount = extractions.filter(e =>
    (e.development_signals?.potential_forms || []).includes(assetType.key)
  ).length;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 shrink-0">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-0.5">Asset Drill-Down</p>
              <h3 className={`font-display text-lg ${assetType.color}`}>{assetType.label} Opportunities</h3>
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-6 py-4 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-4">{directCount} extractions signal {assetType.label.toLowerCase()} potential</p>
            {opportunities.length === 0 ? (
              <p className="text-sm text-muted-foreground/60 text-center py-8">No clustered opportunities yet — keep extracting.</p>
            ) : (
              <div className="space-y-2">
                {opportunities.map((opp, i) => (
                  <motion.button
                    key={opp.name}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveOpportunity(opp)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-xl border ${assetType.border} ${assetType.bg} hover:opacity-80 transition-all group text-left`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{opp.name}</p>
                      {opp.themes.length > 0 && (
                        <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">{opp.themes.join(" · ")}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                      <span className={`text-xs font-medium ${assetType.color}`}>{opp.count} signals</span>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {activeOpportunity && (
          <OpportunityDrawer
            opportunity={activeOpportunity}
            extractions={extractions}
            assetType={assetType}
            onClose={() => setActiveOpportunity(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default function PotentialAssets({ extractions }) {
  const [activeAsset, setActiveAsset] = useState(null);

  const assetCounts = useMemo(() => {
    const counts = {};
    extractions.forEach(e => {
      (e.development_signals?.potential_forms || []).forEach(form => {
        counts[form] = (counts[form] || 0) + 1;
      });
    });
    return counts;
  }, [extractions]);

  const activeTypes = ASSET_TYPES.filter(t => (assetCounts[t.key] || 0) > 0);
  if (activeTypes.length === 0) return null;

  return (
    <>
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <h2 className="font-display text-xl text-foreground">Potential Assets</h2>
          <span className="text-[10px] text-muted-foreground/50 font-mono ml-1">What your signals want to become</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {activeTypes.map((type, i) => {
            const Icon = type.icon;
            const count = assetCounts[type.key] || 0;
            return (
              <motion.button
                key={type.key}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => setActiveAsset(type)}
                className={`flex items-center gap-2.5 p-3 rounded-xl border ${type.border} ${type.bg} hover:opacity-80 transition-all group text-left`}
              >
                <Icon className={`w-4 h-4 ${type.color} flex-shrink-0`} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">{type.label}</p>
                  <p className={`text-lg font-display ${type.color} leading-none mt-0.5`}>{count}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {activeAsset && (
          <AssetDrawer
            assetType={activeAsset}
            extractions={extractions}
            onClose={() => setActiveAsset(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}