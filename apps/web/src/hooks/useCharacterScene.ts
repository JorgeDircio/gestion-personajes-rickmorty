"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Character, CharactersResponse } from "@/types";
import { fetchCharacters } from "@/services/rickmortyApi";
import { useIsMobile } from "./useIsMobile";

const DESKTOP_GRID = 4;
const MOBILE_GRID = 2;
const EMPTY_RESULTS: Character[] = [];

export function useCharacterScene() {
  const isMobile = useIsMobile();
  const gridSize = isMobile ? MOBILE_GRID : DESKTOP_GRID;

  const [data, setData] = useState<CharactersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [gridOffset, setGridOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const results = useMemo(
    () => data?.results ?? EMPTY_RESULTS,
    [data]
  );

  const visibleCharacters = useMemo(
    () => results.slice(gridOffset, gridOffset + gridSize),
    [results, gridOffset, gridSize]
  );

  const fetchScene = useCallback(async (isCancelled: () => boolean = () => false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCharacters({
        page,
        name: nameFilter || undefined,
      });
      if (isCancelled()) return;
      setData(result);
      setGridOffset(0);
      setSelectedId(result.results[0]?.id ?? null);
    } catch {
      if (isCancelled()) return;
      setError("No se encontraron personajes.");
      setData(null);
      setSelectedId(null);
    } finally {
      if (!isCancelled()) setLoading(false);
    }
  }, [page, nameFilter]);

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      void fetchScene(() => cancelled);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchScene]);

  const reload = useCallback(() => {
    void fetchScene();
  }, [fetchScene]);

  const selectedCharacter = useMemo(
    () =>
      results.find((c) => c.id === selectedId) ?? visibleCharacters[0] ?? null,
    [results, selectedId, visibleCharacters]
  );

  const selectedIndex = results.findIndex((c) => c.id === selectedId);
  const canScrollUp = gridOffset > 0;
  const canScrollDown =
    gridOffset + gridSize < results.length ||
    Boolean(data?.info.next && gridOffset + gridSize >= results.length);
  const canCarouselPrev = selectedIndex > 0;
  const canCarouselNext =
    selectedIndex >= 0 && selectedIndex < results.length - 1;
  const hasNextPage = Boolean(data?.info.next);

  const selectCharacter = useCallback(
    (id: number) => {
      const idx = results.findIndex((c) => c.id === id);
      if (isMobile && idx !== -1) {
        setGridOffset(Math.floor(idx / MOBILE_GRID) * MOBILE_GRID);
      }
      setSelectedId(id);
    },
    [results, isMobile]
  );

  function keepSelectionInView(offset: number) {
    const visible = results.slice(offset, offset + gridSize);
    if (
      selectedId !== null &&
      !visible.some((c) => c.id === selectedId) &&
      visible[0]
    ) {
      setSelectedId(visible[0].id);
    }
  }

  function handleSearch(name: string) {
    setPage(1);
    setNameFilter(name);
  }

  function handleScrollUp() {
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
    if (data?.info.next) setPage((p) => p + 1);
  }

  function handleCarouselPrev() {
    if (selectedIndex <= 0) return;
    selectCharacter(results[selectedIndex - 1].id);
  }

  function handleCarouselNext() {
    if (selectedIndex < results.length - 1) {
      selectCharacter(results[selectedIndex + 1].id);
      return;
    }
    if (data?.info.next) setPage((p) => p + 1);
  }

  function showCharacterPreview(character: Character) {
    setData({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [character],
    });
    setGridOffset(0);
    setSelectedId(character.id);
  }

  return {
    loading,
    error,
    results,
    visibleCharacters,
    selectedCharacter,
    selectedId,
    selectCharacter,
    canScrollUp,
    canScrollDown,
    canCarouselPrev,
    canCarouselNext,
    hasNextPage,
    handleSearch,
    handleScrollUp,
    handleScrollDown,
    handleCarouselPrev,
    handleCarouselNext,
    showCharacterPreview,
    reload,
  };
}
