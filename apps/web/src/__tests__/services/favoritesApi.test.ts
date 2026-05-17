import {
  addFavorite,
  getFavorites,
  removeFavoriteByCharacterId,
} from "@/services/favoritesApi";
import { ENV } from "@/lib/env";
import { Favorite } from "@/types";

const mockFavorite: Favorite = {
  id: 1,
  characterId: 42,
  name: "Rick Sanchez",
  image: "https://example.com/rick.png",
  status: "Alive",
  species: "Human",
};

describe("favoritesApi", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("getFavorites fetches from the JSON server URL", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [mockFavorite],
    });

    const result = await getFavorites();

    expect(fetch).toHaveBeenCalledWith(
      `${ENV.JSON_SERVER_URL}/favorites`,
      expect.objectContaining({ cache: "no-store" })
    );
    expect(result).toEqual([mockFavorite]);
  });

  it("getFavorites throws when response is not ok", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false });

    await expect(getFavorites()).rejects.toThrow("Failed to fetch favorites");
  });

  it("addFavorite posts the favorite payload", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockFavorite,
    });

    const payload = {
      characterId: 42,
      name: "Rick Sanchez",
      image: mockFavorite.image,
      status: "Alive" as const,
      species: "Human",
    };

    const result = await addFavorite(payload);

    expect(fetch).toHaveBeenCalledWith(
      `${ENV.JSON_SERVER_URL}/favorites`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
      })
    );
    expect(result).toEqual(mockFavorite);
  });

  it("removeFavoriteByCharacterId calls DELETE by character id", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 204 });

    await removeFavoriteByCharacterId(42);

    expect(fetch).toHaveBeenCalledWith(
      `${ENV.JSON_SERVER_URL}/favorites/by-character/42`,
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("removeFavoriteByCharacterId ignores 404", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 404 });

    await expect(removeFavoriteByCharacterId(99)).resolves.toBeUndefined();
  });

  it("removeFavoriteByCharacterId throws on other errors", async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 500 });

    await expect(removeFavoriteByCharacterId(42)).rejects.toThrow(
      "Failed to remove favorite"
    );
  });
});
