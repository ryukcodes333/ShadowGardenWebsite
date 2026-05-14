import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { signToken } from "../lib/auth.js";

const router = Router();

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// User requests OTP — a bot will pick it up and send it
router.post("/auth/request-otp", async (req, res) => {
  const { username, whatsapp_number } = req.body as { username?: string; whatsapp_number?: string };

  if (!username && !whatsapp_number) {
    res.status(400).json({ error: "username or whatsapp_number is required" });
    return;
  }

  let query = supabase.from("sg_users").select("id,username,display_name,whatsapp_number");
  if (username) {
    query = query.eq("username", username.toLowerCase());
  } else {
    query = query.eq("whatsapp_number", whatsapp_number!);
  }

  const { data: user, error } = await query.single();
  if (error || !user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  if (!user.whatsapp_number) {
    res.status(400).json({ error: "No WhatsApp number linked to this account. Use password login." });
    return;
  }

  // Expire any old OTPs for this user
  await supabase
    .from("sg_otp")
    .update({ used: true })
    .eq("user_id", user.id)
    .eq("used", false);

  const code = generateOtp();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min

  const { data: otp, error: otpErr } = await supabase
    .from("sg_otp")
    .insert({
      user_id: user.id,
      whatsapp_number: user.whatsapp_number,
      code,
      expires_at,
      used: false,
      claimed_by_bot: null,
    })
    .select("id")
    .single();

  if (otpErr || !otp) {
    req.log.error({ error: otpErr }, "otp insert error");
    res.status(500).json({ error: "Failed to create OTP" });
    return;
  }

  res.json({
    otp_id: otp.id,
    message: "OTP created. A bot will send it to your WhatsApp shortly.",
  });
});

// User submits OTP code to login
router.post("/auth/verify-otp", async (req, res) => {
  const { otp_id, code } = req.body as { otp_id?: string; code?: string };

  if (!otp_id || !code) {
    res.status(400).json({ error: "otp_id and code are required" });
    return;
  }

  const { data: otp, error } = await supabase
    .from("sg_otp")
    .select("id,user_id,code,expires_at,used")
    .eq("id", otp_id)
    .single();

  if (error || !otp) {
    res.status(404).json({ error: "OTP not found" });
    return;
  }

  if (otp.used) {
    res.status(400).json({ error: "OTP already used" });
    return;
  }

  if (new Date(otp.expires_at) < new Date()) {
    res.status(400).json({ error: "OTP expired. Please request a new one." });
    return;
  }

  if (otp.code !== code.trim()) {
    res.status(400).json({ error: "Invalid OTP code" });
    return;
  }

  // Mark as used
  await supabase.from("sg_otp").update({ used: true }).eq("id", otp_id);

  // Fetch user
  const { data: user, error: userErr } = await supabase
    .from("sg_users")
    .select("id,username,display_name,avatar_url,whatsapp_number,wallet,bank,level,xp,created_at")
    .eq("id", otp.user_id)
    .single();

  if (userErr || !user) {
    res.status(500).json({ error: "Failed to load user" });
    return;
  }

  const token = signToken({ userId: user.id, username: user.username });
  res.json({ user, token });
});

// === BOT ENDPOINTS ===

// Bot polls for pending OTPs (only unclaimed, not expired)
router.get("/auth/pending-otps", async (req, res) => {
  const botKey = req.headers["x-bot-key"];
  if (!botKey || botKey !== process.env.BOT_SECRET_KEY) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("sg_otp")
    .select("id,whatsapp_number,code,expires_at")
    .eq("used", false)
    .is("claimed_by_bot", null)
    .gt("expires_at", now)
    .order("created_at", { ascending: true })
    .limit(10);

  if (error) {
    res.status(500).json({ error: "DB error" });
    return;
  }

  res.json(data || []);
});

// Bot claims an OTP (prevents other bots from sending the same one)
router.post("/auth/claim-otp/:id", async (req, res) => {
  const botKey = req.headers["x-bot-key"];
  if (!botKey || botKey !== process.env.BOT_SECRET_KEY) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const { bot_name } = req.body as { bot_name?: string };
  const { id } = req.params;

  const { data, error } = await supabase
    .from("sg_otp")
    .update({ claimed_by_bot: bot_name || "bot" })
    .eq("id", id)
    .is("claimed_by_bot", null) // Only claim if not already claimed
    .select("id,whatsapp_number,code")
    .single();

  if (error || !data) {
    res.status(409).json({ error: "OTP already claimed by another bot" });
    return;
  }

  res.json({ success: true, whatsapp_number: data.whatsapp_number, code: data.code });
});

export default router;
