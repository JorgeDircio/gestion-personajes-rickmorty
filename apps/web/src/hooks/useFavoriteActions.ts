"use client";

import { useCallback, useEffect, useState } from "react";
import { Character, Favorite } from "@/types";
import { favoriteToPreviewCharacter } from "@/lib/favoriteToCharacter";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addFavoriteRequest,
  fetchFavoritesRequest,
  removeFavoriteRequest,
} from "@/store/favorites/favoritesSlice";

interface UseFavoriteActionsParams {
  results: Character[];
  setSelectedId: (id: number) => void;
  showCharacterPreview: (character: Character) => void;
  reload: () => void;
}

export function useFavoriteActions({
  results,
  setSelectedId,
  showCharacterPreview,
  reload,
}: UseFavoriteActionsParams) {
  const dispatch = useAppDispatch();
  const { items: favorites, loading: favoritesLoading } = useAppSelector(
    (s) => s.favorites
  );
  const [previewId, setPreviewId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchFavoritesRequest());
  }, [dispatch]);

  const isFavorite = useCallback(
    (characterId: number) =>
      favorites.some((f) => f.characterId === characterId),
    [favorites]
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
      if (isFavorite(character.id)) {
        dispatch(removeFavoriteRequest(character.id));
        clearPreviewIfNeeded(character.id);
        return;
      }
      dispatch(
        addFavoriteRequest({
          characterId: character.id,
          name: character.name,
          image: character.image,
          status: character.status,
          species: character.species,
        })
      );
    },
    [isFavorite, dispatch, clearPreviewIfNeeded]
  );

  const handleSelectFavorite = useCallback(
    (fav: Favorite) => {
      const inList = results.find((c) => c.id === fav.characterId);
      if (inList) {
        setPreviewId(null);
        setSelectedId(fav.characterId);
        return;
      }
      setPreviewId(fav.characterId);
      showCharacterPreview(favoriteToPreviewCharacter(fav));
    },
    [results, setSelectedId, showCharacterPreview]
  );

  const handleRemoveFavorite = useCallback(
    (characterId: number) => {
      dispatch(removeFavoriteRequest(characterId));
      clearPreviewIfNeeded(characterId);
    },
    [dispatch, clearPreviewIfNeeded]
  );

  return {
    favorites,
    favoritesLoading,
    isFavorite,
    handleToggleFavorite,
    handleSelectFavorite,
    handleRemoveFavorite,
  };
}
