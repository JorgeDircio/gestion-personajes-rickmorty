"use client";

import { useCallback, useMemo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Character, CharactersResponse } from "@/types";

interface Params {
  results: Character[];
  visibleCharacters: Character[];
  selectedId: number | null;
  setSelectedId: Dispatch<SetStateAction<number | null>>;
  setData: Dispatch<SetStateAction<CharactersResponse | null>>;
  alignGridToCharacter: (id: number) => void;
  resetGrid: () => void;
  hasPrevPage: boolean;
  onRequestPrevPage: () => void;
}

export function useCharacterSelection({
  results,
  visibleCharacters,
  selectedId,
  setSelectedId,
  setData,
  alignGridToCharacter,
  resetGrid,
  hasPrevPage,
  onRequestPrevPage,
}: Params) {
  const selectedCharacter = useMemo(
    () =>
      results.find((character) => character.id === selectedId) ??
      visibleCharacters[0] ??
      null,
    [results, selectedId, visibleCharacters]
  );

  const selectedIndex = results.findIndex(
    (character) => character.id === selectedId
  );

  const selectCharacter = useCallback(
    (id: number) => {
      alignGridToCharacter(id);
      setSelectedId(id);
    },
    [alignGridToCharacter, setSelectedId]
  );

  function showCharacterPreview(character: Character) {
    setData({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [character],
    });
    resetGrid();
    setSelectedId(character.id);
  }

  function handleCarouselPrev() {
    if (selectedIndex > 0) {
      selectCharacter(results[selectedIndex - 1].id);
      return;
    }
    if (hasPrevPage) onRequestPrevPage();
  }

  function handleCarouselNext(onRequestNextPage: () => void) {
    if (selectedIndex < results.length - 1) {
      selectCharacter(results[selectedIndex + 1].id);
      return;
    }
    onRequestNextPage();
  }

  return {
    selectedCharacter,
    canCarouselPrev: selectedIndex > 0 || hasPrevPage,
    canCarouselNext:
      selectedIndex >= 0 && selectedIndex < results.length - 1,
    selectCharacter,
    showCharacterPreview,
    handleCarouselPrev,
    handleCarouselNext,
  };
}
