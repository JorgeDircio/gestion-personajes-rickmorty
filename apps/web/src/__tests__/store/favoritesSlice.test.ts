import reducer, {
  fetchFavoritesRequest,
  fetchFavoritesSuccess,
  fetchFavoritesFailure,
  addFavoriteRequest,
  addFavoriteSuccess,
  addFavoriteFailure,
  removeFavoriteRequest,
  removeFavoriteSuccess,
  removeFavoriteFailure,
} from "@/store/favorites/favoritesSlice";
import { Favorite } from "@/types";

const mockFav: Favorite = {
  id: 1,
  characterId: 42,
  name: "Rick Sanchez",
  image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg",
  status: "Alive",
  species: "Human",
};

const initialState = { items: [], loading: false, error: null };

describe("favoritesSlice", () => {
  describe("fetchFavorites", () => {
    it("fetchFavoritesRequest sets loading and clears error", () => {
      const state = reducer({ ...initialState, error: "prev" }, fetchFavoritesRequest());
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    it("fetchFavoritesSuccess replaces items and clears loading", () => {
      const state = reducer({ ...initialState, loading: true }, fetchFavoritesSuccess([mockFav]));
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(mockFav);
      expect(state.loading).toBe(false);
    });

    it("fetchFavoritesFailure sets error and clears loading", () => {
      const state = reducer({ ...initialState, loading: true }, fetchFavoritesFailure("Error de red"));
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Error de red");
    });
  });

  describe("addFavorite", () => {
    it("addFavoriteRequest clears error without blocking the grid", () => {
      const payload = { characterId: 1, name: "Rick", image: "", status: "Alive" as const, species: "Human" };
      const state = reducer({ ...initialState, error: "prev" }, addFavoriteRequest(payload));
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("addFavoriteSuccess appends item and clears loading", () => {
      const state = reducer({ ...initialState, loading: true }, addFavoriteSuccess(mockFav));
      expect(state.items).toHaveLength(1);
      expect(state.items[0]).toEqual(mockFav);
      expect(state.loading).toBe(false);
    });

    it("addFavoriteSuccess does not add duplicate characterIds", () => {
      const state = reducer(
        { ...initialState, items: [mockFav] },
        addFavoriteSuccess({ ...mockFav, id: 999 })
      );
      expect(state.items).toHaveLength(1);
    });

    it("addFavoriteFailure sets error and clears loading", () => {
      const state = reducer({ ...initialState, loading: true }, addFavoriteFailure("Error al agregar"));
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Error al agregar");
    });
  });

  describe("removeFavorite", () => {
    it("removeFavoriteRequest clears error without blocking the grid", () => {
      const state = reducer({ ...initialState, error: "prev" }, removeFavoriteRequest(42));
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it("removeFavoriteSuccess removes item by characterId and clears loading", () => {
      const state = reducer(
        { ...initialState, items: [mockFav], loading: true },
        removeFavoriteSuccess(mockFav.characterId)
      );
      expect(state.items).toHaveLength(0);
      expect(state.loading).toBe(false);
    });

    it("removeFavoriteSuccess leaves unrelated items intact", () => {
      const other: Favorite = { ...mockFav, id: 99, characterId: 99 };
      const state = reducer(
        { ...initialState, items: [mockFav, other] },
        removeFavoriteSuccess(mockFav.characterId)
      );
      expect(state.items).toHaveLength(1);
      expect(state.items[0].characterId).toBe(99);
    });

    it("removeFavoriteFailure sets error and clears loading", () => {
      const state = reducer({ ...initialState, loading: true }, removeFavoriteFailure("Error al eliminar"));
      expect(state.loading).toBe(false);
      expect(state.error).toBe("Error al eliminar");
    });
  });
});
