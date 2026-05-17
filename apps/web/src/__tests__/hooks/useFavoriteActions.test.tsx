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

  it("handleSelectFavorite calls selectCharacter when character is in the results list", async () => {
    jest.spyOn(api, "getFavorites").mockResolvedValue([mockFavorite]);
    const navigation = { ...sceneNavigation, results: [mockCharacter] };
    const Wrapper = createWrapper([mockFavorite]);

    const { result } = renderHook(() => useFavoriteActions(navigation), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.handleSelectFavorite(mockFavorite);
    });

    expect(navigation.selectCharacter).toHaveBeenCalledWith(42);
    expect(navigation.showCharacterPreview).not.toHaveBeenCalled();
  });

  it("handleSelectFavorite calls showCharacterPreview when character is not in results", async () => {
    jest.spyOn(api, "getFavorites").mockResolvedValue([mockFavorite]);
    const navigation = { ...sceneNavigation, results: [] };
    const Wrapper = createWrapper([mockFavorite]);

    const { result } = renderHook(() => useFavoriteActions(navigation), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.handleSelectFavorite(mockFavorite);
    });

    expect(navigation.showCharacterPreview).toHaveBeenCalledTimes(1);
    const preview = navigation.showCharacterPreview.mock.calls[0][0];
    expect(preview.id).toBe(42);
    expect(navigation.selectCharacter).not.toHaveBeenCalled();
  });

  it("handleRemoveFavorite removes the favorite optimistically", async () => {
    jest.spyOn(api, "removeFavoriteByCharacterId").mockResolvedValue(undefined);
    const Wrapper = createWrapper([mockFavorite]);

    const { result } = renderHook(
      () => useFavoriteActions(sceneNavigation),
      { wrapper: Wrapper }
    );

    expect(result.current.isFavorite(42)).toBe(true);

    await act(async () => {
      result.current.handleRemoveFavorite(42);
    });

    await waitFor(() => {
      expect(result.current.isFavorite(42)).toBe(false);
    });
    expect(api.removeFavoriteByCharacterId).toHaveBeenCalledWith(42);
  });

  it("favoritesLoading is false once favorites are fetched", async () => {
    jest.spyOn(api, "getFavorites").mockResolvedValue([]);
    const Wrapper = createWrapper();

    const { result } = renderHook(
      () => useFavoriteActions(sceneNavigation),
      { wrapper: Wrapper }
    );

    await waitFor(() => {
      expect(result.current.favoritesLoading).toBe(false);
    });
  });
});
