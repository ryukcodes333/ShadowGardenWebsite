import { Router } from "express";
import bcrypt from "bcryptjs";
import { supabase } from "../lib/supabase.js";
import { signToken, requireAuth } from "../lib/auth.js";

const router = Router();

router.post("/auth/register", async (req, res) => {
  const { username, password, whatsapp_number, display_name } = req.body as {
    username?: string;
    password?: string;
    whatsapp_number?: string;
    display_name?: string;
  };

  if (!username || !password) {
    res.status(400).json({ error: "username and password are required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ error: "password must be at least 6 characters" });
    return;
  }

  const password_hash = await bcrypt.hash(password, 10);
  const dname = display_name || username;

  const { data, error } = await supabase
    .from("sg_users")
    .insert({
      username: username.toLowerCase(),
      password_hash,
      display_name: dname,
      whatsapp_number: whatsapp_number || null,
    })
    .select("id,username,display_name,avatar_url,whatsapp_number,wallet,bank,level,xp,created_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      res.status(409).json({ error: "Username or WhatsApp number already exists" });
    } else {
      req.log.error({ error }, "register error");
      res.status(500).json({ error: "Registration failed" });
    }
    return;
  }

  const token = signToken({ userId: data.id, username: data.username });
  res.status(201).json({ user: data, token });
});

router.post("/auth/login", async (req, res) => {
  const { username, whatsapp_number, password } = req.body as {
    username?: string;
    whatsapp_number?: string;
    password?: string;
  };

  if (!password) {
    res.status(400).json({ error: "password is required" });
    return;
  }
  if (!username && !whatsapp_number) {
    res.status(400).json({ error: "username or whatsapp_number is required" });
    return;
  }

  let query = supabase.from("sg_users").select(
    "id,username,display_name,avatar_url,whatsapp_number,wallet,bank,level,xp,created_at,password_hash"
  );

  if (username) {
    query = query.eq("username", username.toLowerCase());
  } else if (whatsapp_number) {
    query = query.eq("whatsapp_number", whatsapp_number);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, data.password_hash);
  if (!valid) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const { password_hash: _ph, ...user } = data;
  const token = signToken({ userId: user.id, username: user.username });
  res.json({ user, token });
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Logged out successfully" });
});

router.get("/auth/me", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("sg_users")
    .select("id,username,display_name,avatar_url,whatsapp_number,wallet,bank,level,xp,created_at")
    .eq("id", req.user!.userId)
    .single();

  if (error || !data) {
    res.status(401).json({ error: "User not found" });
    return;
  }

  res.json(data);
});

export default router;
