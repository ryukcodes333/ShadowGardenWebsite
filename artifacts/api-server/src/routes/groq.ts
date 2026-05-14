import { Router } from "express";
import { requireAuth } from "../lib/auth.js";

const router = Router();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE = "https://api.groq.com/openai/v1";
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

/**
 * POST /api/cards/analyze
 * Body: { image_url: string }
 * Uses Groq Vision to describe/analyze an anime card image.
 * Returns { description, rarity_hint, character_name, anime_series, tags }
 */
router.post("/cards/analyze", requireAuth, async (req, res) => {
  const { image_url } = req.body as { image_url?: string };

  if (!image_url) {
    res.status(400).json({ error: "image_url is required" });
    return;
  }

  if (!GROQ_API_KEY) {
    res.status(500).json({ error: "GROQ_API_KEY not configured" });
    return;
  }

  try {
    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        max_tokens: 512,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: image_url },
              },
              {
                type: "text",
                text: `You are an anime card game expert. Analyze this anime card image and provide:
1. Character name (if identifiable)
2. Anime series it's from
3. A short atmospheric card description (2-3 sentences, trading-card flavor text style)
4. Suggested rarity tier: common, uncommon, rare, epic, legendary, or god
5. 3-5 tags (e.g. "swordsman", "magic", "villain")

Respond ONLY as valid JSON with keys: character_name, anime_series, description, rarity_hint, tags (array of strings).`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      req.log.error({ status: response.status, err }, "Groq API error");
      res.status(502).json({ error: "Groq API error", detail: err });
      return;
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content ?? "{}";

    let parsed: Record<string, unknown> = {};
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      parsed = { description: content };
    }

    res.json({
      character_name: parsed.character_name ?? null,
      anime_series: parsed.anime_series ?? null,
      description: parsed.description ?? null,
      rarity_hint: parsed.rarity_hint ?? "common",
      tags: Array.isArray(parsed.tags) ? parsed.tags : [],
      model: VISION_MODEL,
    });
  } catch (err) {
    req.log.error({ err }, "Groq vision request failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/cards/analyze-public
 * No auth required — for unauthenticated previews/demos
 */
router.post("/cards/analyze-public", async (req, res) => {
  const { image_url } = req.body as { image_url?: string };

  if (!image_url) {
    res.status(400).json({ error: "image_url is required" });
    return;
  }

  if (!GROQ_API_KEY) {
    res.status(500).json({ error: "GROQ_API_KEY not configured" });
    return;
  }

  try {
    const response = await fetch(`${GROQ_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        max_tokens: 256,
        messages: [
          {
            role: "user",
            content: [
              { type: "image_url", image_url: { url: image_url } },
              {
                type: "text",
                text: `Analyze this anime card image. Return JSON only with keys: character_name, anime_series, description (1 sentence), rarity_hint (common/uncommon/rare/epic/legendary/god).`,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      res.status(502).json({ error: "Groq API error" });
      return;
    }

    const data = (await response.json()) as any;
    const content = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown> = {};
    try {
      const m = content.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    } catch {
      parsed = { description: content };
    }

    res.json({
      character_name: parsed.character_name ?? null,
      anime_series: parsed.anime_series ?? null,
      description: parsed.description ?? null,
      rarity_hint: parsed.rarity_hint ?? "common",
    });
  } catch {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
