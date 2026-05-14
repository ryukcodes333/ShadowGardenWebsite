import { Router } from "express";
import { supabase } from "../lib/supabase.js";

const router = Router();

router.get("/stats", async (_req, res) => {
  const [usersResult, cardsResult] = await Promise.all([
    supabase.from("sg_users").select("*", { count: "exact", head: true }),
    supabase.from("sg_cards").select("*", { count: "exact", head: true }),
  ]);

  res.json({
    users: usersResult.count || 0,
    groups: 2,
    cards: cardsResult.count || 0,
    bots: 3,
  });
});

export default router;
