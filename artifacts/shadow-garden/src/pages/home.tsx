import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import {
  useGetSiteStats,
  getGetSiteStatsQueryKey,
  useGetLeaderboard,
  getGetLeaderboardQueryKey,
  useGetTrendingAnime,
  getGetTrendingAnimeQueryKey,
  useGetFeaturedPokemon,
  getGetFeaturedPokemonQueryKey,
  useGetChatMessages,
  getGetChatMessagesQueryKey,
} from "@workspace/api-client-react";
import logoPath from "@assets/7b7ac791-6c04-4e4f-9e07-44131e4310bb_1778662052573.png";
import sgLogoPath from "/shadow-garden-logo.jpg";
import { MessageCircle, ChevronRight, Zap, Trophy } from "lucide-react";
import { SiDiscord } from "react-icons/si";

function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const steps = 60, duration = 2000;
    const inc = target / steps;
    let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return () => clearInterval(t);
  }, [target]);
  return <span>{count.toLocaleString()}</span>;
}

const rankEmojis = ["🥇", "🥈", "🥉"];

const typeColors: Record<string, string> = {
  fire:     "bg-orange-900/40 text-orange-400",
  water:    "bg-blue-900/30 text-blue-400",
  grass:    "bg-green-900/30 text-green-400",
  electric: "bg-yellow-900/30 text-yellow-400",
  psychic:  "bg-pink-900/30 text-pink-400",
  ice:      "bg-cyan-900/30 text-cyan-400",
  dragon:   "bg-indigo-900/30 text-indigo-400",
  dark:     "bg-gray-800/60 text-gray-300",
  normal:   "bg-gray-700/30 text-gray-400",
  poison:   "bg-purple-900/30 text-purple-400",
  ghost:    "bg-purple-950/50 text-purple-300",
  flying:   "bg-sky-900/30 text-sky-400",
};

const bots = [
  { name: "Alpha", role: "Economy", img: "/bots/alpha.png" },
  { name: "Beta",  role: "Cards",   img: "/bots/beta.png" },
  { name: "Gamma", role: "Guilds",  img: "/bots/gamma.png" },
  { name: "Delta", role: "Events",  img: null },
  { name: "Epsilon", role: "Pokémon", img: "/bots/epsilon.png" },
  { name: "Zeta",  role: "Gambling", img: null },
  { name: "Eta",   role: "Shadow",  img: "/bots/eta.png" },
  { name: "Akeno", role: "Support", img: "/bots/akeno.png" },
];

export default function Home() {
  const { data: stats }       = useGetSiteStats({ query: { queryKey: getGetSiteStatsQueryKey(), staleTime: 60_000 } as any });
  const { data: leaderboard } = useGetLeaderboard({ limit: 5 }, { query: { queryKey: getGetLeaderboardQueryKey({ limit: 5 }), staleTime: 60_000 } as any });
  const { data: trending }    = useGetTrendingAnime(undefined, { query: { queryKey: getGetTrendingAnimeQueryKey(), staleTime: 60_000 } as any });
  const { data: pokemon }     = useGetFeaturedPokemon({ query: { queryKey: getGetFeaturedPokemonQueryKey(), staleTime: 60_000 } as any });
  const { data: chatMessages }= useGetChatMessages(undefined, { query: { queryKey: getGetChatMessagesQueryKey(), staleTime: 30_000 } as any });

  const features = [
    { icon: "🃏", title: "Anime Card System", desc: "Collect and trade 40,000+ anime character cards with rarities from Common to God tier." },
    { icon: "💰", title: "Global Economy", desc: "Earn slimes and orbs, dominate auctions, shop for exclusives, climb the wealth leaderboard." },
    { icon: "🎲", title: "High-Stakes Gambling", desc: "Test your luck in slots, roulette, coin flip. Win big or lose it all." },
    { icon: "⚡", title: "Pokémon Integration", desc: "Catch, train, and battle real Pokémon powered by PokéAPI. Become a champion." },
    { icon: "🌟", title: "Seasonal Events", desc: "Limited-time exclusive cards drop during seasonal events. Don't miss out." },
    { icon: "⚔️", title: "Guild Wars", desc: "Form guilds, capture territory, and earn massive rewards in epic team battles." },
  ];

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <ParticleBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full text-sm text-red-400 mb-8 border border-red-900/30">
            <Zap size={14} />
            <span>The Ultimate Anime Bot Universe</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-tight tracking-tight">
            Shadow{" "}
            <span className="bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent glow-text">
              Garden
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-10">
            Economy, card collecting, Pokémon battles, and gambling — all in your WhatsApp and Discord.
            Join the ultimate anime bot community.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register">
              <button className="btn-primary px-8 py-4 rounded-full font-bold text-white text-lg">
                Join Now
              </button>
            </Link>
            <Link href="/cards">
              <button className="px-8 py-4 glass-card border border-white/10 rounded-full font-bold text-white text-lg hover:border-red-700/40 transition-all">
                View Cards
              </button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { label: "Users",  value: stats?.users ?? 0 },
              { label: "Groups", value: stats?.groups ?? 0 },
              { label: "Cards",  value: stats?.cards ?? 0 },
              { label: "Bots",   value: stats?.bots ?? 0 },
            ].map((s) => (
              <div key={s.label} className="glass-card rounded-2xl p-4 border border-red-900/20">
                <p className="text-2xl font-black text-red-500 glow-text">
                  <AnimatedCounter target={s.value} />
                  {s.label === "Users" && s.value > 0 ? "+" : ""}
                </p>
                <p className="text-xs text-white/45 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bot Carousel */}
      <section className="py-16 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
          <h2 className="text-3xl font-black text-white">
            Meet Our <span className="text-red-500">Bots</span>
          </h2>
          <p className="text-white/40 text-sm mt-2">8 bots, always watching, always ready</p>
        </div>
        <div className="flex gap-6 animate-[scroll_30s_linear_infinite] w-max">
          {[...bots, ...bots].map((bot, i) => (
            <div key={i} className="glass-card rounded-2xl p-5 w-44 flex-shrink-0 flex flex-col items-center gap-3 hover:border-red-700/40 transition-all cursor-pointer border border-white/[0.06] group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-red-900/30 to-black border border-red-800/30 flex items-center justify-center">
                {bot.img ? (
                  <img src={bot.img} alt={bot.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <span className="text-3xl">🤖</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-sm font-bold text-white">{bot.name}</p>
                <p className="text-xs text-red-400/70 mt-0.5">{bot.role}</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" title="Online" />
            </div>
          ))}
        </div>
        <style>{`@keyframes scroll{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      </section>

      {/* Features */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-black text-center text-white mb-3">
            Everything You <span className="text-red-500">Need</span>
          </h2>
          <p className="text-center text-white/45 mb-10">Packed with features to keep you hooked</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-6 hover:border-red-700/30 transition-all group border border-white/[0.06]">
                <span className="text-4xl mb-4 block">{f.icon}</span>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-red-400 transition-colors">
                  {f.title}
                </h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anime Showcase */}
      {trending && trending.length > 0 && (
        <section className="py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-2">
              Trending <span className="text-red-500">Anime</span>
            </h2>
            <p className="text-white/40 mb-7 text-sm">Cards from these series are in the game</p>
            <div className="flex gap-4 overflow-x-auto pb-4">
              {trending.map((anime) => (
                <div key={anime.id} className="flex-shrink-0 w-36 glass-card rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer border border-white/[0.06]">
                  <div className="relative h-52">
                    <img src={anime.cover_image} alt={anime.title} className="w-full h-full object-cover" loading="lazy" />
                    {anime.score && (
                      <div className="absolute top-2 right-2 bg-black/75 rounded-full px-2 py-0.5 text-xs text-yellow-400 font-bold">
                        ★ {anime.score.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-white text-xs font-semibold line-clamp-2">{anime.title}</p>
                    {anime.genres[0] && <p className="text-red-400/70 text-xs mt-0.5">{anime.genres[0]}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leaderboard Preview */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-7">
            <div>
              <h2 className="text-3xl font-black text-white">Top <span className="text-red-500">Players</span></h2>
              <p className="text-white/40 text-sm mt-1">Richest players in Shadow Garden</p>
            </div>
            <Link href="/leaderboard">
              <button className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium">
                View All <ChevronRight size={15} />
              </button>
            </Link>
          </div>
          <div className="glass-card rounded-2xl overflow-hidden border border-white/[0.06]">
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.slice(0, 5).map((entry, i) => (
                <div key={entry.user_id} className={`flex items-center gap-4 p-4 border-b border-white/[0.04] last:border-0 ${i === 0 ? "bg-red-900/10" : ""}`}>
                  <span className="text-xl font-black w-8 text-center">{rankEmojis[i] ?? `#${entry.rank}`}</span>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-900/50 to-red-700/30 border border-white/10 flex items-center justify-center text-sm font-bold text-white overflow-hidden flex-shrink-0">
                    {entry.avatar_url ? <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" /> : entry.display_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{entry.display_name}</p>
                    {entry.title && <p className="text-white/35 text-xs truncate">{entry.title}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-red-400 font-bold text-sm">{entry.value.toLocaleString()}</p>
                    <p className="text-white/35 text-xs">slimes</p>
                  </div>
                  {i === 0 && <Trophy className="text-yellow-500" size={16} />}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-white/35">No players yet — be the first!</div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Pokémon */}
      {pokemon && pokemon.length > 0 && (
        <section className="py-16 relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-2">Featured <span className="text-red-500">Pokémon</span></h2>
            <p className="text-white/40 mb-7 text-sm">Catch them in our bot</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {pokemon.slice(0, 6).map((p) => (
                <div key={p.id} className="glass-card rounded-2xl p-4 flex flex-col items-center hover:border-red-700/30 hover:scale-105 transition-all cursor-pointer border border-white/[0.06]">
                  <img src={p.sprite} alt={p.name} className="w-20 h-20 object-contain" loading="lazy" />
                  <p className="text-white text-xs font-semibold capitalize mt-2">{p.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1.5 justify-center">
                    {p.types.map((t) => (
                      <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${typeColors[t] || "bg-white/10 text-white/55"}`}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Community Links */}
      <section className="py-16 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center text-white mb-2">Join Our <span className="text-red-500">Community</span></h2>
          <p className="text-center text-white/40 mb-10">Connect with thousands of players</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Discord */}
            <div className="glass-card rounded-2xl p-7 flex flex-col items-center text-center border border-white/[0.06]">
              <div className="w-14 h-14 bg-indigo-900/30 rounded-2xl flex items-center justify-center mb-4">
                <SiDiscord size={28} className="text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Discord Server</h3>
              <p className="text-white/40 text-sm mb-6">Join our Discord for news, updates, and events.</p>
              <button disabled className="px-6 py-2.5 rounded-full text-sm font-semibold text-white/30 border border-white/10 cursor-not-allowed">Coming Soon</button>
            </div>

            {/* WhatsApp Group 1 — using Shadow Garden logo */}
            <div className="glass-card rounded-2xl p-7 flex flex-col items-center text-center neon-border border border-red-900/30">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 border border-red-800/30">
                <img src={sgLogoPath} alt="Shadow Garden" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">WhatsApp Group 1</h3>
              <p className="text-white/40 text-sm mb-6">Main community — trading, events, and announcements.</p>
              <a href="https://chat.whatsapp.com/JNej9puksowC2tDwyS1kta" target="_blank" rel="noopener noreferrer">
                <button className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold text-white">Join Group</button>
              </a>
            </div>

            {/* WhatsApp Group 2 — using Shadow Garden logo */}
            <div className="glass-card rounded-2xl p-7 flex flex-col items-center text-center border border-white/[0.06]">
              <div className="w-16 h-16 rounded-2xl overflow-hidden mb-4 border border-white/10 opacity-50">
                <img src={sgLogoPath} alt="Shadow Garden" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">WhatsApp Group 2</h3>
              <p className="text-white/40 text-sm mb-6">Secondary group for extra activities.</p>
              <button disabled className="px-6 py-2.5 rounded-full text-sm font-semibold text-white/30 border border-white/10 cursor-not-allowed">Coming Soon</button>
            </div>
          </div>
        </div>
      </section>

      {/* Live Chat Preview */}
      <section className="py-16 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="glass-card rounded-2xl p-6 border border-white/[0.06]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <MessageCircle className="text-red-400" size={20} />
                <h3 className="font-bold text-white">Community Chat</h3>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              </div>
              <Link href="/chat">
                <button className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1">
                  Open Chat <ChevronRight size={12} />
                </button>
              </Link>
            </div>
            <div className="space-y-3 max-h-44 overflow-hidden">
              {chatMessages && chatMessages.length > 0 ? (
                chatMessages.slice(-4).map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-900/50 to-red-700/30 flex items-center justify-center text-xs font-bold text-white flex-shrink-0 overflow-hidden">
                      {msg.avatar_url ? <img src={msg.avatar_url} alt="" className="w-full h-full object-cover" /> : msg.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-red-400 text-xs font-semibold">{msg.display_name}</span>
                      <p className="text-white/65 text-sm">{msg.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/35 text-sm text-center py-4">No messages yet. Be the first!</p>
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-white/[0.04]">
              <Link href="/chat">
                <button className="w-full py-2 btn-primary rounded-xl text-white text-sm font-medium">
                  Join the Chat
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img src={logoPath} alt="Shadow Garden" className="h-9 w-auto" />
            <div className="flex items-center gap-6">
              {["/", "/leaderboard", "/cards", "/chat"].map((href, i) => (
                <Link key={href} href={href} className="text-sm text-white/40 hover:text-red-400 transition-colors">
                  {["Home", "Leaderboard", "Cards", "Chat"][i]}
                </Link>
              ))}
            </div>
          </div>
          <p className="text-center text-white/25 text-sm mt-8">© 2025 Shadow Garden. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
