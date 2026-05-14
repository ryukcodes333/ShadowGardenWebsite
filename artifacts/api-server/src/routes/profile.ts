import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth, optionalAuth } from "../lib/auth.js";

const router = Router();

router.get("/profile", optionalAuth, async (req, res) => {
  const userId = (req.query["userId"] as string) || req.user?.userId;

  if (!userId) {
    res.status(400).json({ error: "userId is required or must be authenticated" });
    return;
  }

  const { data: user, error } = await supabase
    .from("sg_users")
    .select("id,username,display_name,avatar_url,cover_url,frame_url,bio,title,wallet,bank,level,xp,guild,created_at")
    .eq("id", userId)
    .single();

  if (error || !user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const { count: cardCount } = await supabase
    .from("sg_user_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { count: pokemonCount } = await supabase
    .from("sg_user_pokemon")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const { data: achievements } = await supabase
    .from("sg_achievements")
    .select("name")
    .eq("user_id", userId);

  res.json({
    ...user,
    card_count: cardCount || 0,
    pokemon_count: pokemonCount || 0,
    achievements: (achievements || []).map((a) => a.name),
  });
});

router.patch("/profile", requireAuth, async (req, res) => {
  const allowed = ["display_name", "bio", "title", "avatar_url", "cover_url", "frame_url"];
  const updates: Record<string, string> = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      updates[key] = req.body[key];
    }
  }

  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: "No valid fields to update" });
    return;
  }

  const { data, error } = await supabase
    .from("sg_users")
    .update(updates)
    .eq("id", req.user!.userId)
    .select("id,username,display_name,avatar_url,cover_url,frame_url,bio,title,wallet,bank,level,xp,guild,created_at")
    .single();

  if (error || !data) {
    res.status(500).json({ error: "Update failed" });
    return;
  }

  const { count: cardCount } = await supabase
    .from("sg_user_cards")
    .select("*", { count: "exact", head: true })
    .eq("user_id", req.user!.userId);

  const { count: pokemonCount } = await supabase
    .from("sg_user_pokemon")
    .select("*", { count: "exact", head: true })
    .eq("user_id", req.user!.userId);

  const { data: achievements } = await supabase
    .from("sg_achievements")
    .select("name")
    .eq("user_id", req.user!.userId);

  res.json({
    ...data,
    card_count: cardCount || 0,
    pokemon_count: pokemonCount || 0,
    achievements: (achievements || []).map((a) => a.name),
  });
});

export default router;
