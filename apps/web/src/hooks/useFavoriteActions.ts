"use client";

import {
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react";
import { Character, Favorite } from "@/types";
import { favoriteToPreviewCharacter } from "@/lib/favoriteToCharacter";
import type { CharacterSceneNavigation } from "@/hooks/characterScene/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addFavoriteRequest,
  fetchFavoritesRequest,
  removeFavoriteRequest,
} from "@/store/favorites/favoritesSlice";

type OptimisticFavoriteAction =
  | { type: "add"; favorite: Omit<Favorite, "id"> }
  | { type: "remove"; characterId: number };

function applyFavoriteOptimistic(
  state: Favorite[],
  action: OptimisticFavoriteAction
): Favorite[] {
  if (action.type === "remove") {
    return state.filter((f) => f.characterId !== action.characterId);
  }
  if (state.some((f) => f.characterId === action.favorite.characterId)) {
    return state;
  }
  return [
    ...state,
    { ...action.favorite, id: -action.favorite.characterId },
  ];
}

export function useFavoriteActions({
  results,
  selectCharacter,
  showCharacterPreview,
  reload,
}: CharacterSceneNavigation) {
  const dispatch = useAppDispatch();
  const { items: favorites, loading: favoritesLoading } = useAppSelector(
    (s) => s.favorites
  );
  const [optimisticFavorites, applyOptimistic] = useOptimistic(
    favorites,
    applyFavoriteOptimistic
  );
  const [, startFavoriteTransition] = useTransition();
  const [previewId, setPreviewId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchFavoritesRequest());
  }, [dispatch]);

  const isFavorite = useCallback(
    (characterId: number) =>
      optimisticFavorites.some((f) => f.characterId === characterId),
    [optimisticFavorites]
  );

  const clearPreviewIfNeeded = useCallback(
    (characterId: number) => {
      if (previewId === characterId) {
        setPreviewId(null);
        reload();
      }
    },
    [previewId, reload]
  );

  const handleToggleFavorite = useCallback(
    (character: Character) => {
      const favoritePayload = {
        characterId: character.id,
        name: character.name,
        image: character.image,
        status: character.status,
        species: character.species,
      };

      startFavoriteTransition(() => {
        if (isFavorite(character.id)) {
          applyOptimistic({ type: "remove", characterId: character.id });
          dispatch(removeFavoriteRequest(character.id));
          clearPreviewIfNeeded(character.id);
          return;
        }

        applyOptimistic({ type: "add", favorite: favoritePayload });
        dispatch(addFavoriteRequest(favoritePayload));
      });
    },
    [
      isFavorite,
      dispatch,
      clearPreviewIfNeeded,
      applyOptimistic,
      startFavoriteTransition,
    ]
  );

  const handleSelectFavorite = useCallback(
    (fav: Favorite) => {
      const inList = results.find((c) => c.id === fav.characterId);
      if (inList) {
        setPreviewId(null);
        selectCharacter(fav.characterId);
        return;
      }
      setPreviewId(fav.characterId);
      showCharacterPreview(favoriteToPreviewCharacter(fav));
    },
    [results, selectCharacter, showCharacterPreview]
  );

  const handleRemoveFavorite = useCallback(
    (characterId: number) => {
      startFavoriteTransition(() => {
        applyOptimistic({ type: "remove", characterId });
        dispatch(removeFavoriteRequest(characterId));
        clearPreviewIfNeeded(characterId);
      });
    },
    [dispatch, clearPreviewIfNeeded, applyOptimistic, startFavoriteTransition]
  );

  return {
    favorites: optimisticFavorites,
    favoritesLoading: favoritesLoading && favorites.length === 0,
    isFavorite,
    handleToggleFavorite,
    handleSelectFavorite,
    handleRemoveFavorite,
  };
}
