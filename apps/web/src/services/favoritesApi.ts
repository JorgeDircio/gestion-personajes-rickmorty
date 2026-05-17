import { ENV } from "@/lib/env";
import { parseJsonResponse } from "@/lib/parseJsonResponse";
import { Favorite } from "@/types";

const fetchOptions: RequestInit = { cache: "no-store" };

function favoritesUrl(path = ""): string {
  const base = ENV.JSON_SERVER_URL.replace(/\/$/, "");
  return path ? `${base}/favorites/${path}` : `${base}/favorites`;
}

export async function getFavorites(): Promise<Favorite[]> {
  const res = await fetch(favoritesUrl(), fetchOptions);
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return parseJsonResponse<Favorite[]>(res);
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
  const res = await fetch(favoritesUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    ...fetchOptions,
  });
  if (!res.ok) throw new Error("Failed to add favorite");
  return parseJsonResponse<Favorite>(res);
}

export async function removeFavoriteByCharacterId(
  characterId: number
): Promise<void> {
  const res = await fetch(favoritesUrl(`by-character/${characterId}`), {
    method: "DELETE",
    ...fetchOptions,
  });
  if (res.status === 404) return;
  if (!res.ok) {
    const error = new Error("Failed to remove favorite") as Error & {
      status: number;
    };
    error.status = res.status;
    throw error;
  }
}
