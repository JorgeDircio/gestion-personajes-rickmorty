import { Favorite } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_JSON_SERVER_URL ?? "http://localhost:3001";

export async function getFavorites(): Promise<Favorite[]> {
  const res = await fetch(`${BASE_URL}/favorites`);
  if (!res.ok) throw new Error("Failed to fetch favorites");
  return res.json();
}

export async function addFavorite(
  favorite: Omit<Favorite, "id">
): Promise<Favorite> {
  const res = await fetch(`${BASE_URL}/favorites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(favorite),
  });
  if (!res.ok) throw new Error("Failed to add favorite");
  return res.json();
}

export async function removeFavorite(id: number): Promise<void> {
  const res = await fetch(`${BASE_URL}/favorites/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to remove favorite");
}
