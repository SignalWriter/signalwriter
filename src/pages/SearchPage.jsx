import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { Search, ArrowRight, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { motion } from "framer-motion";
import TagBadge from "@/components/shared/TagBadge";

export default function SearchPage() {
  const [query, setQuery] = useState("");

  const { data: extractions = [] } = useQuery({
    queryKey: ["search-extractions"],
    queryFn: () => base44.entities.Extraction.list("-created_date", 100),
  });

  const { data: penfires = [] } = useQuery({
    queryKey: ["search-penfires"],
    queryFn: () => base44.entities.Penfire.list("-updated_date", 50),
  });

  const searchLower = query.toLowerCase().trim();

  const filteredExtractions = searchLower
    ? extractions.filter(e =>
        (e.title || "").toLowerCase().includes(searchLower) ||
        (e.core_insight || "").toLowerCase().includes(searchLower) ||
        (e.suggested_tags || []).some(t => t.toLowerCase().includes(searchLower)) ||
        (e.quotable_lines || []).some(q => q.toLowerCase().includes(searchLower)) ||
        (e.emerging_patterns || []).some(p => p.toLowerCase().includes(searchLower))
      )
    : [];

  const filteredPenfires = searchLower
    ? penfires.filter(p =>
        (p.name || "").toLowerCase().includes(searchLower) ||
        (p.description || "").toLowerCase().includes(searchLower) ||
        (p.tags || []).some(t => t.toLowerCase().includes(searchLower))
      )
    : [];

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 md:py-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-foreground mb-6">Search</h1>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search extractions, insights, tags, patterns..."
            className="pl-11 h-12 bg-card/50 border-border/50 focus:border-primary/40 text-sm"
            autoFocus
          />
        </div>
      </motion.div>

      {searchLower && (
        <div className="space-y-6">
          {filteredPenfires.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Flame className="w-3 h-3 text-primary" />
                Penfires ({filteredPenfires.length})
              </h3>
              <div className="space-y-2">
                {filteredPenfires.map(p => (
                  <div key={p.id} className="p-4 rounded-xl border border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-2 mb-1">
                      <Flame className="w-3.5 h-3.5 text-primary" />
                      <h4 className="text-sm font-medium text-foreground">{p.name}</h4>
                    </div>
                    <p className="text-xs text-muted-foreground">{p.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {filteredExtractions.length > 0 && (
            <section>
              <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-3">
                Extractions ({filteredExtractions.length})
              </h3>
              <div className="space-y-2">
                {filteredExtractions.map(e => (
                  <Link
                    key={e.id}
                    to={`/extraction/${e.id}`}
                    className="block p-4 rounded-xl border border-border/40 bg-card/50 hover:bg-card hover:border-border/80 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {e.title}
                      </h4>
                      <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    {e.core_insight && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{e.core_insight}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-muted-foreground/60">
                        {format(new Date(e.created_date), "MMM d")}
                      </span>
                      {e.suggested_tags?.slice(0, 3).map(tag => (
                        <TagBadge key={tag} tag={tag} />
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {filteredExtractions.length === 0 && filteredPenfires.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">No results for "{query}"</p>
            </div>
          )}
        </div>
      )}

      {!searchLower && (
        <div className="text-center py-16">
          <p className="text-sm text-muted-foreground">Start typing to search your signal archive</p>
        </div>
      )}
    </div>
  );
}