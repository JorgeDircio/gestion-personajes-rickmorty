import { ENV } from "@/lib/env";
import { Character, CharacterFilters, CharactersResponse } from "@/types";

export async function fetchCharacters(
  filters: CharacterFilters = {}
): Promise<CharactersResponse> {
  const params = new URLSearchParams();
  if (filters.name) params.set("name", filters.name);
  if (filters.status) params.set("status", filters.status);
  if (filters.page) params.set("page", String(filters.page));

  const res = await fetch(`${ENV.RICK_MORTY_API_URL}/character?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch characters");
  return res.json();
}

export async function fetchCharacterById(id: number): Promise<Character> {
  const res = await fetch(`${ENV.RICK_MORTY_API_URL}/character/${id}`);
  if (!res.ok) throw new Error(`Character ${id} not found`);
  return res.json();
}
