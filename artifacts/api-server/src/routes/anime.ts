import { Router } from "express";

const router = Router();

const ANILIST_API = "https://graphql.anilist.co";

router.get("/anime/trending", async (req, res) => {
  const limit = Math.min(Number(req.query["limit"]) || 10, 20);

  const query = `
    query ($perPage: Int) {
      Page(perPage: $perPage) {
        media(sort: TRENDING_DESC, type: ANIME, status_in: [RELEASING, FINISHED]) {
          id
          title { romaji english }
          coverImage { large }
          bannerImage
          episodes
          averageScore
          status
          genres
          description(asHtml: false)
        }
      }
    }
  `;

  try {
    const response = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables: { perPage: limit } }),
    });

    if (!response.ok) {
      res.status(502).json({ error: "Failed to fetch from Anilist" });
      return;
    }

    const json = (await response.json()) as any;
    const media = json?.data?.Page?.media || [];

    const result = media.map((m: any) => ({
      id: m.id,
      title: m.title.english || m.title.romaji,
      cover_image: m.coverImage?.large || "",
      banner_image: m.bannerImage || null,
      episodes: m.episodes || null,
      score: m.averageScore ? m.averageScore / 10 : null,
      status: m.status || "UNKNOWN",
      genres: m.genres || [],
      description: m.description
        ? m.description.replace(/<[^>]+>/g, "").slice(0, 200)
        : null,
    }));

    res.json(result);
  } catch (err) {
    res.status(502).json({ error: "Anilist API unavailable" });
  }
});

export default router;
