import { favoriteToPreviewCharacter } from "@/lib/favoriteToCharacter";
import { Favorite } from "@/types";

const mockFavorite: Favorite = {
  id: 1,
  characterId: 42,
  name: "Rick Sanchez",
  image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  status: "Alive",
  species: "Human",
};

describe("favoriteToPreviewCharacter", () => {
  it("maps characterId to id", () => {
    const character = favoriteToPreviewCharacter(mockFavorite);
    expect(character.id).toBe(42);
  });

  it("preserves name, status, species and image", () => {
    const character = favoriteToPreviewCharacter(mockFavorite);
    expect(character.name).toBe("Rick Sanchez");
    expect(character.status).toBe("Alive");
    expect(character.species).toBe("Human");
    expect(character.image).toBe(mockFavorite.image);
  });

  it("fills placeholder fields", () => {
    const character = favoriteToPreviewCharacter(mockFavorite);
    expect(character.type).toBe("");
    expect(character.gender).toBe("unknown");
    expect(character.origin.name).toBe("—");
    expect(character.location.name).toBe("—");
    expect(character.episode).toEqual([]);
    expect(character.url).toBe("");
    expect(character.created).toBe("");
  });
});
