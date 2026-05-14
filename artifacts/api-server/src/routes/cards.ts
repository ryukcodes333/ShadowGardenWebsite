import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.get("/cards", async (req, res) => {
  const page = Math.max(1, Number(req.query["page"]) || 1);
  const limit = Math.min(Number(req.query["limit"]) || 24, 100);
  const rarity = req.query["rarity"] as string | undefined;
  const search = req.query["search"] as string | undefined;
  const userId = req.query["userId"] as string | undefined;
  const offset = (page - 1) * limit;

  if (userId) {
    let query = supabase
      .from("sg_user_cards")
      .select("card_id, obtained_at, sg_cards!inner(id,name,rarity,image_url,anime,description)", {
        count: "exact",
      })
      .eq("user_id", userId)
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      res.json({ cards: [], total: 0, page, limit });
      return;
    }

    const cards = (data || []).map((row: any) => ({
      id: row.sg_cards.id,
      name: row.sg_cards.name,
      rarity: row.sg_cards.rarity,
      image_url: row.sg_cards.image_url,
      anime: row.sg_cards.anime || null,
      description: row.sg_cards.description || null,
      obtained_at: row.obtained_at,
    }));

    res.json({ cards, total: count || 0, page, limit });
    return;
  }

  let query = supabase
    .from("sg_cards")
    .select("id,name,rarity,image_url,anime,description", { count: "exact" });

  if (rarity) query = query.eq("rarity", rarity);
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, count, error } = await query
    .order("rarity", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    res.json({ cards: [], total: 0, page, limit });
    return;
  }

  const cards = (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    rarity: c.rarity,
    image_url: c.image_url,
    anime: c.anime || null,
    description: c.description || null,
    obtained_at: null,
  }));

  res.json({ cards, total: count || 0, page, limit });
});

export default router;
