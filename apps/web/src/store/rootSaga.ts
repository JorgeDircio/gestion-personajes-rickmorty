import { all } from "redux-saga/effects";
import { favoritesSaga } from "./favorites/favoritesSaga";

export function* rootSaga() {
  yield all([favoritesSaga()]);
}
