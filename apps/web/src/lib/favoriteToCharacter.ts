import { Character, Favorite } from "@/types";

export function favoriteToPreviewCharacter(fav: Favorite): Character {
  return {
    id: fav.characterId,
    name: fav.name,
    status: fav.status,
    species: fav.species,
    type: "",
    gender: "unknown",
    origin: { name: "—", url: "" },
    location: { name: "—", url: "" },
    image: fav.image,
    episode: [],
    url: "",
    created: "",
  };
}
