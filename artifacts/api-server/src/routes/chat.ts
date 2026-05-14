import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { requireAuth, optionalAuth } from "../lib/auth.js";

const router = Router();

router.get("/chat/messages", optionalAuth, async (req, res) => {
  const limit = Math.min(Number(req.query["limit"]) || 50, 100);
  const before = req.query["before"] as string | undefined;

  let query = supabase
    .from("sg_chat_messages")
    .select("id,user_id,username,display_name,avatar_url,content,created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt("created_at", before);
  }

  const { data, error } = await query;

  if (error) {
    res.json([]);
    return;
  }

  res.json((data || []).reverse());
});

router.post("/chat/messages", requireAuth, async (req, res) => {
  const { content } = req.body as { content?: string };

  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: "content is required" });
    return;
  }

  if (content.length > 500) {
    res.status(400).json({ error: "message too long (max 500 chars)" });
    return;
  }

  const { data: user } = await supabase
    .from("sg_users")
    .select("username,display_name,avatar_url")
    .eq("id", req.user!.userId)
    .single();

  if (!user) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  const { data, error } = await supabase
    .from("sg_chat_messages")
    .insert({
      user_id: req.user!.userId,
      username: user.username,
      display_name: user.display_name,
      avatar_url: user.avatar_url || null,
      content: content.trim(),
    })
    .select("id,user_id,username,display_name,avatar_url,content,created_at")
    .single();

  if (error || !data) {
    req.log.error({ error }, "send message error");
    res.status(500).json({ error: "Failed to send message" });
    return;
  }

  res.status(201).json(data);
});

export default router;
