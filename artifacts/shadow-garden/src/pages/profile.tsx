import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import {
  useGetProfile,
  useListCards,
  useUpdateProfile,
  getGetProfileQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/context/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Camera, ImageIcon, Frame, ChevronRight } from "lucide-react";

// ─── Rarity colours ──────────────────────────────────────────────────────────
const rarityConfig: Record<string, { badge: string; label: string }> = {
  god:       { badge: "bg-gradient-to-r from-red-600 to-yellow-400",   label: "God" },
  legendary: { badge: "bg-gradient-to-r from-orange-500 to-yellow-400", label: "Legendary" },
  epic:      { badge: "bg-gradient-to-r from-red-500 to-rose-400",     label: "Epic" },
  rare:      { badge: "bg-gradient-to-r from-red-800 to-red-500",      label: "Rare" },
  uncommon:  { badge: "bg-gradient-to-r from-red-950 to-red-700",      label: "Uncommon" },
  common:    { badge: "bg-gradient-to-r from-gray-600 to-gray-500",    label: "Common" },
};

// ─── Preset frames the bot can award ─────────────────────────────────────────
const PRESET_FRAMES = [
  { id: "none",    label: "None",    url: null },
  { id: "gold",    label: "Gold",    url: "https://i.imgur.com/e7USYEJ.png" },
  { id: "silver",  label: "Silver",  url: "https://i.imgur.com/ZyWTXpP.png" },
  { id: "crimson", label: "Crimson", url: "https://i.imgur.com/9TKpABR.png" },
  { id: "shadow",  label: "Shadow",  url: "https://i.imgur.com/f3oHYid.png" },
];

type Tab = "overview" | "deck" | "inventory" | "pokemon";

// ─── Image resize helper ──────────────────────────────────────────────────────
async function resizeToDataUrl(file: File, maxPx: number, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function Profile() {
  const { user: me } = useAuth();
  const [, setLocation] = useLocation();
  const [tab, setTab] = useState<Tab>("overview");
  const [framePickerOpen, setFramePickerOpen] = useState(false);
  const [uploadingField, setUploadingField] = useState<"avatar_url" | "cover_url" | null>(null);
  const queryClient = useQueryClient();
  const updateMutation = useUpdateProfile();

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef  = useRef<HTMLInputElement>(null);

  const userId = me?.id;

  // ── Real-time: poll every 8 s (Supabase realtime requires anon key on frontend)
  const { data: profile, isLoading } = useGetProfile(
    userId ? { userId } : undefined,
    {
      query: {
        enabled: !!userId,
        queryKey: getGetProfileQueryKey(userId ? { userId } : undefined),
        refetchInterval: 8000,
      } as any,
    }
  );

  const deckParams = userId ? { userId, limit: 24, page: 1 } : undefined;
  const { data: deckData } = useListCards(
    deckParams,
    { query: { queryKey: ["cards", deckParams], enabled: tab === "deck" && !!userId } as any }
  );

  // ── Handle file upload (avatar or cover) ─────────────────────────────────
  const handleFileChange = useCallback(
    async (field: "avatar_url" | "cover_url", file: File | undefined) => {
      if (!file) return;
      setUploadingField(field);
      try {
        const maxPx = field === "avatar_url" ? 300 : 1200;
        const dataUrl = await resizeToDataUrl(file, maxPx);
        updateMutation.mutate(
          { data: { [field]: dataUrl } },
          {
            onSuccess: () =>
              queryClient.invalidateQueries({
                queryKey: getGetProfileQueryKey({ userId }),
              }),
            onSettled: () => setUploadingField(null),
          }
        );
      } catch {
        setUploadingField(null);
      }
    },
    [updateMutation, queryClient, userId]
  );

  // ── Select a frame ────────────────────────────────────────────────────────
  const applyFrame = (frameUrl: string | null) => {
    updateMutation.mutate(
      { data: { frame_url: frameUrl ?? "" } },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: getGetProfileQueryKey({ userId }),
          }),
      }
    );
    setFramePickerOpen(false);
  };

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!userId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ParticleBackground />
        <Navbar />
        <div className="relative z-10 text-center">
          <p className="text-white/55 mb-4">Sign in to view your profile</p>
          <Link href="/login">
            <button className="btn-primary px-6 py-3 rounded-full text-white font-semibold">Sign In</button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <ParticleBackground />
        <Navbar />
        <div className="relative z-10 w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = profile?.display_name || me?.display_name || "?";
  const achievements = profile?.achievements || [];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hidden file inputs */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange("avatar_url", e.target.files?.[0])}
      />
      <input
        ref={coverInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange("cover_url", e.target.files?.[0])}
      />

      {/* ── Cover image ──────────────────────────────────────────────── */}
      <div className="relative w-full h-[52vw] max-h-72 min-h-40">
        {profile?.cover_url ? (
          <img
            src={profile.cover_url}
            alt="Cover"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-red-950 via-[#1a0000] to-black" />
        )}
        {/* dark gradient fade into page */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#0a0a0a]" />
      </div>

      {/* ── Main profile card (pulled up over cover) ─────────────────── */}
      <div className="relative z-10 -mt-20 max-w-2xl mx-auto px-4 pb-24">

        {/* Avatar + frame */}
        <div className="flex flex-col items-center -mt-2">
          <div className="relative w-32 h-32 mb-4">
            {/* Avatar circle */}
            <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0a0a0a] bg-gradient-to-br from-red-900 to-red-700 flex items-center justify-center text-4xl font-black text-white shadow-2xl">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>

            {/* Frame overlay */}
            {profile?.frame_url && (
              <img
                src={profile.frame_url}
                alt="frame"
                className="absolute inset-[-8px] w-[calc(100%+16px)] h-[calc(100%+16px)] pointer-events-none object-contain"
              />
            )}

            {/* Upload spinner */}
            {uploadingField === "avatar_url" && (
              <div className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {/* Name / title / phone */}
          <h1 className="text-2xl font-black text-white text-center">{displayName}</h1>
          {profile?.title && (
            <p className="text-white/50 text-sm mt-0.5 text-center">{profile.title}</p>
          )}
          {me?.whatsapp_number && (
            <p className="text-white/30 text-xs mt-0.5">{me.whatsapp_number}</p>
          )}
          {profile?.bio && (
            <p className="text-white/40 text-sm mt-2 text-center max-w-xs leading-relaxed">{profile.bio}</p>
          )}
        </div>

        {/* ── Edit buttons ─────────────────────────────────────────────── */}
        <div className="flex justify-center gap-2 mt-5 flex-wrap">
          <button
            onClick={() => avatarInputRef.current?.click()}
            disabled={!!uploadingField}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-white/70 text-xs font-semibold hover:border-red-700/50 hover:text-white transition-all bg-white/[0.04] disabled:opacity-50"
          >
            <Camera size={13} />
            {uploadingField === "avatar_url" ? "Uploading…" : "Edit Avatar"}
          </button>
          <button
            onClick={() => coverInputRef.current?.click()}
            disabled={!!uploadingField}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-white/70 text-xs font-semibold hover:border-red-700/50 hover:text-white transition-all bg-white/[0.04] disabled:opacity-50"
          >
            <ImageIcon size={13} />
            {uploadingField === "cover_url" ? "Uploading…" : "Edit Cover"}
          </button>
          <button
            onClick={() => setFramePickerOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/15 text-white/70 text-xs font-semibold hover:border-red-700/50 hover:text-white transition-all bg-white/[0.04]"
          >
            <Frame size={13} />
            Edit Frame
          </button>
        </div>

        {/* ── Stats 2-column grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {[
            { icon: "🖥️", label: "Wallet", value: `$${(profile?.wallet ?? 0).toLocaleString()}` },
            { icon: "🏛️", label: "Bank",   value: `$${(profile?.bank   ?? 0).toLocaleString()}` },
            { icon: "⭐", label: "Level",  value: profile?.level ?? 1 },
            { icon: "⚡", label: "XP",     value: (profile?.xp ?? 0).toLocaleString() },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 bg-white/[0.05] rounded-2xl px-5 py-4 border border-white/[0.06]"
            >
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-white font-bold text-base leading-none">{s.value}</p>
                <p className="text-white/40 text-xs mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Extra stats row */}
        <div className="grid grid-cols-2 gap-3 mt-3">
          {[
            { icon: "🃏", label: "Cards",    value: profile?.card_count    ?? 0 },
            { icon: "🔴", label: "Pokémon",  value: profile?.pokemon_count ?? 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 bg-white/[0.05] rounded-2xl px-5 py-4 border border-white/[0.06]"
            >
              <span className="text-xl">{s.icon}</span>
              <div>
                <p className="text-white font-bold text-base leading-none">{s.value}</p>
                <p className="text-white/40 text-xs mt-1">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mt-6 overflow-x-auto pb-1 scrollbar-none">
          {(["overview", "deck", "inventory", "pokemon"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                tab === t
                  ? "bg-red-600 text-white shadow-lg shadow-red-900/40"
                  : "bg-white/[0.05] text-white/50 hover:text-white border border-white/[0.07]"
              }`}
            >
              {t === "overview"   ? "Overview"
               : t === "deck"    ? "Deck"
               : t === "inventory" ? "Inventory"
               : "Pokémon"}
            </button>
          ))}
        </div>

        {/* ── Tab content ─────────────────────────────────────────────── */}
        <div className="mt-5 space-y-4">

          {tab === "overview" && (
            <>
              {/* Achievements */}
              <div>
                <h3 className="text-white font-bold text-base mb-3">Achievements</h3>
                {achievements.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {achievements.map((ach: string, i: number) => (
                      <span key={i} className="px-3 py-1 rounded-full text-sm text-red-400 border border-red-900/30 bg-red-900/10">
                        {ach}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-white/30 text-sm">No achievements yet — keep playing!</p>
                )}
              </div>

              {/* Guild */}
              <div>
                <h3 className="text-white font-bold text-base mb-2">Guild</h3>
                {profile?.guild ? (
                  <div className="flex items-center justify-between bg-white/[0.04] rounded-2xl px-5 py-4 border border-white/[0.06]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">⚔️</span>
                      <div>
                        <p className="text-white font-semibold">{profile.guild}</p>
                        <p className="text-white/35 text-xs">Member</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-white/30" />
                  </div>
                ) : (
                  <p className="text-white/30 text-sm">Not in a guild yet — join one with the bot!</p>
                )}
              </div>

              {/* Activity */}
              <div>
                <h3 className="text-white font-bold text-base mb-2">Activity</h3>
                <p className="text-white/30 text-sm">
                  Joined Shadow Garden — collecting cards and Pokémon since the beginning.
                </p>
              </div>
            </>
          )}

          {tab === "deck" && (
            <div>
              {deckData && deckData.cards.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {deckData.cards.map((card) => {
                    const cfg = rarityConfig[card.rarity] || rarityConfig.common;
                    return (
                      <div
                        key={card.id}
                        className="rounded-2xl overflow-hidden bg-white/[0.04] border border-white/[0.06] hover:scale-[1.03] transition-transform"
                      >
                        <div className="relative aspect-[3/4]">
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                          <div className={`absolute top-1.5 right-1.5 ${cfg.badge} rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white`}>
                            {cfg.label}
                          </div>
                          <p className="absolute bottom-1.5 left-2 right-2 text-white text-[11px] font-bold truncate">
                            {card.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-16 text-center">
                  <p className="text-4xl mb-3">🃏</p>
                  <p className="text-white/35">No cards yet — collect them with the bot!</p>
                </div>
              )}
            </div>
          )}

          {tab === "inventory" && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">🎒</p>
              <p className="text-white/35">Inventory coming soon</p>
              <p className="text-white/20 text-sm mt-1">Items you earn from the bot will appear here</p>
            </div>
          )}

          {tab === "pokemon" && (
            <div className="py-16 text-center">
              <p className="text-4xl mb-3">⚡</p>
              <p className="text-white/35">
                {(profile?.pokemon_count ?? 0) > 0
                  ? `You have ${profile!.pokemon_count} Pokémon`
                  : "No Pokémon yet — catch some with the bot!"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Frame picker modal ─────────────────────────────────────────── */}
      {framePickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setFramePickerOpen(false)}
        >
          <div
            className="bg-[#111] border border-white/10 rounded-3xl p-6 w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-white font-bold text-lg mb-4">Choose Frame</h3>
            <div className="grid grid-cols-3 gap-3">
              {PRESET_FRAMES.map((f) => (
                <button
                  key={f.id}
                  onClick={() => applyFrame(f.url)}
                  className={`rounded-2xl border p-3 flex flex-col items-center gap-2 transition-all ${
                    (profile?.frame_url || null) === f.url
                      ? "border-red-600 bg-red-900/20"
                      : "border-white/10 hover:border-white/30 bg-white/[0.03]"
                  }`}
                >
                  {f.url ? (
                    <div className="w-12 h-12 relative">
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-red-900 to-red-700" />
                      <img src={f.url} alt={f.label} className="absolute inset-[-4px] w-[calc(100%+8px)] h-[calc(100%+8px)] object-contain" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center text-white/30 text-xs">
                      off
                    </div>
                  )}
                  <span className="text-white/60 text-xs">{f.label}</span>
                </button>
              ))}
            </div>
            <p className="text-white/25 text-xs text-center mt-4">
              More frames unlock through bot achievements
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
