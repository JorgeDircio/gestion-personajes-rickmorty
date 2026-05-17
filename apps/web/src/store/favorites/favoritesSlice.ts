import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Favorite } from "@/types";

interface FavoritesState {
  items: Favorite[];
  loading: boolean;
  error: string | null;
}

const initialState: FavoritesState = {
  items: [],
  loading: false,
  error: null,
};

const favoritesSlice = createSlice({
  name: "favorites",
  initialState,
  reducers: {
    fetchFavoritesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    fetchFavoritesSuccess(state, action: PayloadAction<Favorite[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    fetchFavoritesFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    addFavoriteRequest: {
      reducer(state) {
        state.error = null;
      },
      prepare(payload: Omit<Favorite, "id">) {
        return { payload };
      },
    },
    addFavoriteSuccess(state, action: PayloadAction<Favorite>) {
      if (
        !state.items.some((f) => f.characterId === action.payload.characterId)
      ) {
        state.items.push(action.payload);
      }
      state.loading = false;
    },
    addFavoriteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    removeFavoriteRequest: {
      reducer(state) {
        state.error = null;
      },
      prepare(characterId: number) {
        return { payload: characterId };
      },
    },
    removeFavoriteSuccess(state, action: PayloadAction<number>) {
      state.items = state.items.filter(
        (f) => f.characterId !== action.payload
      );
      state.loading = false;
    },
    removeFavoriteFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchFavoritesRequest,
  fetchFavoritesSuccess,
  fetchFavoritesFailure,
  addFavoriteRequest,
  addFavoriteSuccess,
  addFavoriteFailure,
  removeFavoriteRequest,
  removeFavoriteSuccess,
  removeFavoriteFailure,
} = favoritesSlice.actions;

export default favoritesSlice.reducer;
