import { Router } from "express";

const router = Router();

const FEATURED_IDS = [25, 1, 4, 7, 6, 150, 151, 94, 143, 130, 59, 131];

router.get("/pokemon/featured", async (_req, res) => {
  try {
    const pokemon = await Promise.all(
      FEATURED_IDS.map(async (id) => {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
        if (!response.ok) return null;
        const data = (await response.json()) as any;
        return {
          id: data.id,
          name: data.name,
          sprite:
            data.sprites?.other?.["official-artwork"]?.front_default ||
            data.sprites?.front_default ||
            `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
          types: (data.types || []).map((t: any) => t.type.name),
          base_experience: data.base_experience || null,
          height: data.height,
          weight: data.weight,
        };
      })
    );

    res.json(pokemon.filter(Boolean));
  } catch {
    res.status(502).json({ error: "PokeAPI unavailable" });
  }
});

export default router;
