"use client";

import { useMemo, useState } from "react";
import { Character } from "@/types";
import { MOBILE_GRID_SIZE } from "@/lib/constants";

interface Params {
  results: Character[];
  gridSize: number;
  selectedId: number | null;
  setSelectedId: (id: number) => void;
  isMobile: boolean;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onRequestNextPage: () => void;
  onRequestPrevPage: () => void;
}

export function useCharacterGrid({
  results,
  gridSize,
  selectedId,
  setSelectedId,
  isMobile,
  hasNextPage,
  hasPrevPage,
  onRequestNextPage,
  onRequestPrevPage,
}: Params) {
  const [gridOffset, setGridOffset] = useState(0);

  const visibleCharacters = useMemo(
    () => results.slice(gridOffset, gridOffset + gridSize),
    [results, gridOffset, gridSize]
  );

  function resetGrid() {
    setGridOffset(0);
  }

  function scrollToEnd() {
    setGridOffset(Math.max(0, results.length - gridSize));
  }

  function alignGridToCharacter(id: number) {
    if (!isMobile) return;
    const index = results.findIndex((character) => character.id === id);
    if (index === -1) return;
    setGridOffset(Math.floor(index / MOBILE_GRID_SIZE) * MOBILE_GRID_SIZE);
  }

  function keepSelectionInView(offset: number) {
    const visible = results.slice(offset, offset + gridSize);
    if (
      selectedId !== null &&
      !visible.some((character) => character.id === selectedId) &&
      visible[0]
    ) {
      setSelectedId(visible[0].id);
    }
  }

  function handleScrollUp() {
    if (gridOffset === 0 && hasPrevPage) {
      onRequestPrevPage();
      return;
    }
    const nextOffset = Math.max(0, gridOffset - gridSize);
    setGridOffset(nextOffset);
    keepSelectionInView(nextOffset);
  }

  function handleScrollDown() {
    if (gridOffset + gridSize < results.length) {
      const nextOffset = gridOffset + gridSize;
      setGridOffset(nextOffset);
      keepSelectionInView(nextOffset);
      return;
    }
    if (hasNextPage) onRequestNextPage();
  }

  return {
    gridOffset,
    visibleCharacters,
    canScrollUp: gridOffset > 0 || hasPrevPage,
    canScrollDown:
      gridOffset + gridSize < results.length ||
      (hasNextPage && gridOffset + gridSize >= results.length),
    resetGrid,
    scrollToEnd,
    alignGridToCharacter,
    handleScrollUp,
    handleScrollDown,
  };
}
