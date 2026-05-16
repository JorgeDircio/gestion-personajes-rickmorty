import { call, put, takeLatest, takeEvery } from "redux-saga/effects";
import { PayloadAction } from "@reduxjs/toolkit";
import { Favorite } from "@/types";
import * as api from "@/services/favoritesApi";
import {
  fetchFavoritesRequest,
  fetchFavoritesSuccess,
  fetchFavoritesFailure,
  addFavoriteRequest,
  addFavoriteSuccess,
  addFavoriteFailure,
  removeFavoriteRequest,
  removeFavoriteSuccess,
  removeFavoriteFailure,
} from "./favoritesSlice";

function* handleFetchFavorites() {
  try {
    const favorites: Favorite[] = yield call(api.getFavorites);
    yield put(fetchFavoritesSuccess(favorites));
  } catch (err) {
    yield put(fetchFavoritesFailure((err as Error).message));
  }
}

function* handleAddFavorite(
  action: PayloadAction<Omit<Favorite, "id">>
) {
  try {
    const favorite: Favorite = yield call(api.addFavorite, action.payload);
    yield put(addFavoriteSuccess(favorite));
  } catch (err) {
    yield put(addFavoriteFailure((err as Error).message));
  }
}

function* handleRemoveFavorite(action: PayloadAction<number>) {
  try {
    yield call(api.removeFavorite, action.payload);
    yield put(removeFavoriteSuccess(action.payload));
  } catch (err) {
    yield put(removeFavoriteFailure((err as Error).message));
  }
}

export function* favoritesSaga() {
  yield takeLatest(fetchFavoritesRequest.type, handleFetchFavorites);
  yield takeEvery(addFavoriteRequest.type, handleAddFavorite);
  yield takeEvery(removeFavoriteRequest.type, handleRemoveFavorite);
}
