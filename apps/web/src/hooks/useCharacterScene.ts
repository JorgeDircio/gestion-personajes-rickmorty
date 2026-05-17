"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useIsMobile } from "@/hooks/useIsMobile";
import { DESKTOP_GRID_SIZE, MOBILE_GRID_SIZE } from "@/lib/constants";
import { useCharacterGrid } from "@/hooks/characterScene/useCharacterGrid";
import { useCharacterSelection } from "@/hooks/characterScene/useCharacterSelection";
import { useCharactersQuery } from "@/hooks/characterScene/useCharactersQuery";
import { CharactersResponse } from "@/types";

export function useCharacterScene(initialCharacters?: CharactersResponse | null) {
  const isMobile = useIsMobile();
  const gridSize = isMobile ? MOBILE_GRID_SIZE : DESKTOP_GRID_SIZE;
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const gridApiRef = useRef({ resetGrid: () => {} });

  const handleResultsLoaded = useCallback((firstId: number | null) => {
    gridApiRef.current.resetGrid();
    setSelectedId(firstId);
  }, []);

  const query = useCharactersQuery(handleResultsLoaded, initialCharacters);

  const grid = useCharacterGrid({
    results: query.results,
    gridSize,
    selectedId,
    setSelectedId,
    isMobile,
    hasNextPage: query.hasNextPage,
    onRequestNextPage: query.requestNextPage,
  });

  useEffect(() => {
    gridApiRef.current.resetGrid = grid.resetGrid;
  }, [grid.resetGrid]);

  const selection = useCharacterSelection({
    results: query.results,
    visibleCharacters: grid.visibleCharacters,
    selectedId,
    setSelectedId,
    setData: query.setData,
    alignGridToCharacter: grid.alignGridToCharacter,
    resetGrid: grid.resetGrid,
  });

  return {
    loading: query.loading,
    error: query.error,
    results: query.results,
    visibleCharacters: grid.visibleCharacters,
    selectedCharacter: selection.selectedCharacter,
    selectedId,
    selectCharacter: selection.selectCharacter,
    canScrollUp: grid.canScrollUp,
    canScrollDown: grid.canScrollDown,
    canCarouselPrev: selection.canCarouselPrev,
    canCarouselNext: selection.canCarouselNext,
    hasNextPage: query.hasNextPage,
    searchPending: query.searchPending,
    handleSearch: query.handleSearch,
    handleScrollUp: grid.handleScrollUp,
    handleScrollDown: grid.handleScrollDown,
    handleCarouselPrev: selection.handleCarouselPrev,
    handleCarouselNext: () =>
      selection.handleCarouselNext(query.requestNextPage),
    showCharacterPreview: selection.showCharacterPreview,
    reload: query.reload,
  };
}
