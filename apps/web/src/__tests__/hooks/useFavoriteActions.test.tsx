import { renderHook, act, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { ReactNode } from "react";
import { useFavoriteActions } from "@/hooks/useFavoriteActions";
import favoritesReducer, {
  fetchFavoritesSuccess,
} from "@/store/favorites/favoritesSlice";
import { favoritesSaga } from "@/store/favorites/favoritesSaga";
import * as api from "@/services/favoritesApi";
import { Character, Favorite } from "@/types";

jest.mock("@/services/favoritesApi");

const mockCharacter: Character = {
  id: 42,
  name: "Rick Sanchez",
  status: "Alive",
  species: "Human",
  type: "",
  gender: "Male",
  origin: { name: "Earth", url: "" },
  location: { name: "Earth", url: "" },
  image: "",
  episode: [],
  url: "",
  created: "",
};

const mockFavorite: Favorite = {
  id: 1,
  characterId: 42,
  name: "Rick Sanchez",
  image: "",
  status: "Alive",
  species: "Human",
};

const sceneNavigation = {
  results: [mockCharacter],
  selectCharacter: jest.fn(),
  showCharacterPreview: jest.fn(),
  reload: jest.fn(),
};

function createWrapper(initialFavorites: Favorite[] = []) {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: { favorites: favoritesReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  });
  sagaMiddleware.run(favoritesSaga);

  if (initialFavorites.length > 0) {
    store.dispatch(fetchFavoritesSuccess(initialFavorites));
  } else {
    jest.spyOn(api, "getFavorites").mockResolvedValue([]);
  }

  return function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("useFavoriteActions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("marks character as favorite optimistically on toggle add", async () => {
    jest.spyOn(api, "addFavorite").mockResolvedValue(mockFavorite);
    const Wrapper = createWrapper();

    const { result } = renderHook(
      () => useFavoriteActions(sceneNavigation),
      { wrapper: Wrapper }
    );

    await waitFor(() => expect(api.getFavorites).toHaveBeenCalled());
    expect(result.current.isFavorite(42)).toBe(false);

    await act(async () => {
      result.current.handleToggleFavorite(mockCharacter);
    });

    await waitFor(() => {
      expect(result.current.isFavorite(42)).toBe(true);
    });
    expect(result.current.favorites.some((f) => f.characterId === 42)).toBe(
      true
    );
  });

  it("unmarks character optimistically on toggle remove", async () => {
    jest.spyOn(api, "removeFavoriteByCharacterId").mockResolvedValue(undefined);
    const Wrapper = createWrapper([mockFavorite]);

    const { result } = renderHook(
      () => useFavoriteActions(sceneNavigation),
      { wrapper: Wrapper }
    );

    expect(result.current.isFavorite(42)).toBe(true);

    await act(async () => {
      result.current.handleToggleFavorite(mockCharacter);
    });

    await waitFor(() => {
      expect(result.current.isFavorite(42)).toBe(false);
    });
    expect(result.current.favorites.some((f) => f.characterId === 42)).toBe(
      false
    );
  });
});
