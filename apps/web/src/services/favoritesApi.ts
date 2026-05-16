import { Favorite } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_JSON_SERVER_URL ?? "http://localhost:3001";

const fetchOptions: RequestInit = { cache: "no-store" };

export async function getFavorites(): Promise<Favorite[]> {
  const res = await fetch(`${BASE_URL}/favorites`, fetchOptions);
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function addFavorite(
  favorite: Omit<Favorite, "id">
): Promise<Favorite> {
  const body = {
    characterId: favorite.characterId,
    name: favorite.name,
    image: favorite.image,
    status: favorite.status,
    species: favorite.species,
  };
  const res = await fetch(`${BASE_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...fetchOptions,
  });
  if (!res.ok) throw new Error("Failed to add favorite");
  return res.json();
}

export async function removeFavoriteByCharacterId(
  characterId: number
): Promise<void> {
  const res = await fetch(
    `${BASE_URL}/favorites/by-character/${characterId}`,
    {
      method: "DELETE",
      ...fetchOptions,
    }
  );
  if (res.status === 404) return;
  if (!res.ok) {
    const error = new Error("Failed to remove favorite") as Error & {
      status: number;
    };
    error.status = res.status;
    throw error;
  }
}
