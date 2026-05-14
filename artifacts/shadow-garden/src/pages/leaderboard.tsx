import { useState } from "react";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import { useGetLeaderboard, getGetLeaderboardQueryKey, GetLeaderboardType } from "@workspace/api-client-react";
import { Trophy } from "lucide-react";

type SortKey = "balance" | "xp" | "cards" | "pokemon";

const sortOptions: { key: SortKey; label: string; icon: string; unit: string; type: string }[] = [
  { key: "balance", label: "Richest",     icon: "💰", unit: "slimes",   type: GetLeaderboardType.balance },
  { key: "xp",      label: "Highest XP", icon: "⭐", unit: "XP",       type: GetLeaderboardType.xp },
  { key: "cards",   label: "Most Cards", icon: "🃏", unit: "cards",    type: GetLeaderboardType.cards },
  { key: "pokemon", label: "Pokémon",    icon: "⚡", unit: "caught",   type: GetLeaderboardType.pokemon },
];

const rankColors = ["text-yellow-400", "text-gray-300", "text-amber-600"];
const rankBg     = [
  "bg-yellow-900/20 border-yellow-800/30",
  "bg-gray-800/20 border-gray-700/30",
  "bg-amber-900/20 border-amber-800/30",
];

export default function Leaderboard() {
  const [sort, setSort] = useState<SortKey>("balance");

  const current = sortOptions.find((o) => o.key === sort)!;
  const params = { limit: 50, type: current.type as any };

  const { data, isLoading } = useGetLeaderboard(params, {
    query: { queryKey: getGetLeaderboardQueryKey(params), staleTime: 30_000 } as any,
  });

  return (
    <div className="min-h-screen bg-background">
      <ParticleBackground />
      <Navbar />

      <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-16">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            <span className="text-red-500">Leader</span>board
          </h1>
          <p className="text-white/40 text-sm">Top players across Shadow Garden</p>
        </div>

        {/* Sort tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-1">
          {sortOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setSort(opt.key)}
              data-testid={`sort-${opt.key}`}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 ${
                sort === opt.key
                  ? "btn-primary text-white"
                  : "glass-card text-white/55 hover:text-white border border-white/[0.06]"
              }`}
            >
              <span>{opt.icon}</span> {opt.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-16 animate-pulse border border-white/[0.04]" />
            ))}
          </div>
        ) : data && data.length > 0 ? (
          <div className="space-y-2">
            {data.map((entry, i) => {
              const rank = i + 1;
              const isTop3 = rank <= 3;
              return (
                <div
                  key={entry.user_id}
                  data-testid={`leaderboard-row-${rank}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    isTop3 ? rankBg[i] : "glass-card border-white/[0.05]"
                  }`}
                >
                  <div className={`w-9 text-center font-black text-lg ${isTop3 ? rankColors[i] : "text-white/35"}`}>
                    {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                  </div>

                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-900/50 to-red-700/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                    {entry.avatar_url
                      ? <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      : entry.display_name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate flex items-center gap-2">
                      {entry.display_name}
                      {rank === 1 && <Trophy size={13} className="text-yellow-500" />}
                    </p>
                    {entry.title && <p className="text-white/30 text-xs truncate">{entry.title}</p>}
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`font-bold text-sm ${isTop3 ? rankColors[i] : "text-red-400"}`}>
                      {(entry.value ?? 0).toLocaleString()}
                    </p>
                    <p className="text-white/30 text-xs">{current.unit}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-24 text-center">
            <p className="text-white/35 text-lg">No players yet</p>
            <p className="text-white/25 text-sm mt-2">Be the first to join and claim the top spot!</p>
          </div>
        )}
      </div>
    </div>
  );
}
