import { configureStore } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import favoritesReducer, {
  addFavoriteRequest,
  fetchFavoritesRequest,
  removeFavoriteRequest,
} from "@/store/favorites/favoritesSlice";
import { favoritesSaga } from "@/store/favorites/favoritesSaga";
import * as api from "@/services/favoritesApi";
import { Favorite } from "@/types";

jest.mock("@/services/favoritesApi");

const mockFavorite: Favorite = {
  id: 1,
  characterId: 42,
  name: "Rick Sanchez",
  image: "",
  status: "Alive",
  species: "Human",
};

function createTestStore() {
  const sagaMiddleware = createSagaMiddleware();
  const store = configureStore({
    reducer: { favorites: favoritesReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ thunk: false }).concat(sagaMiddleware),
  });
  sagaMiddleware.run(favoritesSaga);
  return store;
}

function waitFor(
  predicate: () => boolean,
  timeoutMs = 2000,
  intervalMs = 10
): Promise<void> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (predicate()) {
        resolve();
        return;
      }
      if (Date.now() - started > timeoutMs) {
        reject(new Error("Timed out waiting for store update"));
        return;
      }
      setTimeout(tick, intervalMs);
    };
    tick();
  });
}

describe("favoritesSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetchFavoritesRequest loads favorites into the store", async () => {
    jest.spyOn(api, "getFavorites").mockResolvedValue([mockFavorite]);
    const store = createTestStore();

    store.dispatch(fetchFavoritesRequest());

    await waitFor(() => store.getState().favorites.items.length === 1);
    expect(store.getState().favorites.items[0]).toEqual(mockFavorite);
    expect(store.getState().favorites.loading).toBe(false);
  });

  it("addFavoriteRequest adds a favorite via the API", async () => {
    jest.spyOn(api, "addFavorite").mockResolvedValue(mockFavorite);
    const store = createTestStore();

    store.dispatch(
      addFavoriteRequest({
        characterId: 42,
        name: "Rick Sanchez",
        image: "",
        status: "Alive",
        species: "Human",
      })
    );

    await waitFor(() => store.getState().favorites.items.length === 1);
    expect(api.addFavorite).toHaveBeenCalled();
    expect(store.getState().favorites.items[0].characterId).toBe(42);
  });

  it("addFavoriteRequest skips API when character is already favorited", async () => {
    jest.spyOn(api, "getFavorites").mockResolvedValue([mockFavorite]);
    jest.spyOn(api, "addFavorite");
    const store = createTestStore();

    store.dispatch(fetchFavoritesRequest());
    await waitFor(() => store.getState().favorites.items.length === 1);

    store.dispatch(
      addFavoriteRequest({
        characterId: 42,
        name: "Rick Sanchez",
        image: "",
        status: "Alive",
        species: "Human",
      })
    );

    await waitFor(() => !store.getState().favorites.loading);
    expect(api.addFavorite).not.toHaveBeenCalled();
    expect(store.getState().favorites.items).toHaveLength(1);
  });

  it("removeFavoriteRequest removes favorite by characterId", async () => {
    jest.spyOn(api, "getFavorites").mockResolvedValue([mockFavorite]);
    jest.spyOn(api, "removeFavoriteByCharacterId").mockResolvedValue(undefined);
    const store = createTestStore();

    store.dispatch(fetchFavoritesRequest());
    await waitFor(() => store.getState().favorites.items.length === 1);

    store.dispatch(removeFavoriteRequest(42));

    await waitFor(() => store.getState().favorites.items.length === 0);
    expect(api.removeFavoriteByCharacterId).toHaveBeenCalledWith(42);
  });
});
