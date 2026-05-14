import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.get("/leaderboard", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"]) || 10, 50);
  const type = (req.query["type"] as string) || "balance";

  let orderColumn = "wallet";
  if (type === "xp") orderColumn = "xp";
  else if (type === "balance") orderColumn = "wallet";

  if (type === "cards") {
    const { data: cardCounts, error } = await supabase
      .from("sg_user_cards")
      .select("user_id")
      .limit(10000);

    if (error) {
      res.json([]);
      return;
    }

    const countMap: Record<string, number> = {};
    for (const row of cardCounts || []) {
      countMap[row.user_id] = (countMap[row.user_id] || 0) + 1;
    }

    const topUserIds = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topUserIds.length === 0) {
      res.json([]);
      return;
    }

    const { data: users } = await supabase
      .from("sg_users")
      .select("id,username,display_name,avatar_url,level,title")
      .in("id", topUserIds);

    const result = topUserIds.map((uid, idx) => {
      const u = (users || []).find((x) => x.id === uid);
      return {
        rank: idx + 1,
        user_id: uid,
        username: u?.username || "unknown",
        display_name: u?.display_name || "Unknown",
        avatar_url: u?.avatar_url || null,
        value: countMap[uid],
        level: u?.level || 1,
        title: u?.title || null,
      };
    });

    res.json(result);
    return;
  }

  if (type === "pokemon") {
    const { data: pokeCounts } = await supabase
      .from("sg_user_pokemon")
      .select("user_id")
      .limit(10000);

    const countMap: Record<string, number> = {};
    for (const row of pokeCounts || []) {
      countMap[row.user_id] = (countMap[row.user_id] || 0) + 1;
    }

    const topUserIds = Object.entries(countMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([id]) => id);

    if (topUserIds.length === 0) {
      res.json([]);
      return;
    }

    const { data: users } = await supabase
      .from("sg_users")
      .select("id,username,display_name,avatar_url,level,title")
      .in("id", topUserIds);

    const result = topUserIds.map((uid, idx) => {
      const u = (users || []).find((x) => x.id === uid);
      return {
        rank: idx + 1,
        user_id: uid,
        username: u?.username || "unknown",
        display_name: u?.display_name || "Unknown",
        avatar_url: u?.avatar_url || null,
        value: countMap[uid],
        level: u?.level || 1,
        title: u?.title || null,
      };
    });

    res.json(result);
    return;
  }

  const { data, error } = await supabase
    .from("sg_users")
    .select("id,username,display_name,avatar_url,wallet,xp,level,title")
    .order(orderColumn, { ascending: false })
    .limit(limit);

  if (error) {
    res.json([]);
    return;
  }

  const result = (data || []).map((u, idx) => ({
    rank: idx + 1,
    user_id: u.id,
    username: u.username,
    display_name: u.display_name,
    avatar_url: u.avatar_url || null,
    value: type === "xp" ? u.xp : u.wallet,
    level: u.level,
    title: u.title || null,
  }));

  res.json(result);
});

export default router;
