import { useState } from "react";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import { useListCards, getListCardsQueryKey } from "@workspace/api-client-react";
import { Search, Filter } from "lucide-react";

const RARITIES = ["", "common", "uncommon", "rare", "epic", "legendary", "god"] as const;

const rarityConfig: Record<string, { label: string; gradient: string; badge: string }> = {
  god:       { label: "God",       gradient: "from-red-600 via-orange-500 to-yellow-400", badge: "bg-gradient-to-r from-red-600 to-yellow-400" },
  legendary: { label: "Legendary", gradient: "from-orange-600 to-yellow-400",             badge: "bg-gradient-to-r from-orange-600 to-yellow-400" },
  epic:      { label: "Epic",      gradient: "from-red-600 to-rose-400",                  badge: "bg-gradient-to-r from-red-600 to-rose-400" },
  rare:      { label: "Rare",      gradient: "from-red-800 to-red-500",                   badge: "bg-gradient-to-r from-red-800 to-red-500" },
  uncommon:  { label: "Uncommon",  gradient: "from-red-950 to-red-700",                   badge: "bg-gradient-to-r from-red-950 to-red-700" },
  common:    { label: "Common",    gradient: "from-gray-600 to-gray-500",                 badge: "bg-gradient-to-r from-gray-600 to-gray-500" },
};

function isGif(url: string) {
  return url?.toLowerCase().endsWith(".gif");
}

export default function Cards() {
  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("");
  const [page, setPage] = useState(1);

  const params = {
    page,
    limit: 24,
    ...(search ? { search } : {}),
    ...(rarity ? { rarity: rarity as any } : {}),
  };

  const { data, isLoading } = useListCards(params, {
    query: { queryKey: getListCardsQueryKey(params) },
  });

  const totalPages = data ? Math.ceil(data.total / 24) : 1;

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Card <span className="text-red-500">Gallery</span>
          </h1>
          <p className="text-white/40">
            {data ? `${data.total.toLocaleString()} cards available` : "Explore the card collection"}
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" size={16} />
            <input
              type="search"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search cards, anime, character..."
              data-testid="input-card-search"
              className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-red-700/50 focus:ring-1 focus:ring-red-700/30 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25" size={16} />
            <select
              value={rarity}
              onChange={(e) => { setRarity(e.target.value); setPage(1); }}
              data-testid="select-rarity"
              className="bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-8 py-3 text-white focus:outline-none focus:border-red-700/50 transition-all appearance-none cursor-pointer"
            >
              <option value="" className="bg-[#0a0a0a]">All Rarities</option>
              {RARITIES.filter(Boolean).map((r) => (
                <option key={r} value={r} className="bg-[#0a0a0a] capitalize">{rarityConfig[r]?.label || r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Rarity badges */}
        <div className="flex flex-wrap gap-2 mb-8">
          {RARITIES.map((r) => (
            <button
              key={r}
              onClick={() => { setRarity(r); setPage(1); }}
              data-testid={`filter-rarity-${r || "all"}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                rarity === r
                  ? r
                    ? `${rarityConfig[r]?.badge} text-white shadow-lg shadow-red-900/30`
                    : "bg-red-700 text-white"
                  : "glass-card text-white/45 hover:text-white border border-white/[0.06]"
              }`}
            >
              {r ? rarityConfig[r]?.label : "All"}
            </button>
          ))}
        </div>

        {/* Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-64 animate-pulse border border-white/[0.06]" />
            ))}
          </div>
        ) : data && data.cards.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {data.cards.map((card) => {
              const cfg = rarityConfig[card.rarity] || rarityConfig.common;
              const isAnimated = isGif(card.image_url);
              return (
                <div
                  key={card.id}
                  className="glass-card rounded-2xl overflow-hidden hover:scale-105 transition-all cursor-pointer border border-white/[0.06] hover:border-red-800/40 hover:shadow-xl hover:shadow-red-900/20 group"
                  data-testid={`card-${card.id}`}
                >
                  <div className="relative aspect-[3/4]">
                    {/* GIFs play automatically via <img>, statics just render */}
                    <img
                      src={card.image_url}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://i.imgur.com/oiGxZm9.png";
                      }}
                    />
                    {isAnimated && (
                      <div className="absolute top-2 left-2 bg-red-600/80 rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white">
                        GIF
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                    <div className={`absolute top-2 right-2 ${cfg.badge} rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow`}>
                      {cfg.label}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-white text-xs font-bold leading-tight">{card.name}</p>
                      {card.anime && <p className="text-white/45 text-[10px] mt-0.5 truncate">{card.anime}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-white/35 text-lg">No cards found</p>
            <p className="text-white/20 text-sm mt-2">Run schema.sql in Supabase to seed cards</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              data-testid="btn-prev-page"
              className="px-4 py-2 glass-card rounded-xl text-white/55 hover:text-white disabled:opacity-35 transition-all border border-white/[0.06]">
              Previous
            </button>
            <span className="text-white/45 text-sm">Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              data-testid="btn-next-page"
              className="px-4 py-2 glass-card rounded-xl text-white/55 hover:text-white disabled:opacity-35 transition-all border border-white/[0.06]">
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
