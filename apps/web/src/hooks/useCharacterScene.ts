"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Character, CharactersResponse } from "@/types";
import { fetchCharacters } from "@/services/rickmortyApi";
import { useIsMobile } from "./useIsMobile";

const DESKTOP_GRID = 4;
const MOBILE_GRID = 2;

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

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCharacters({
        page,
        name: nameFilter || undefined,
      });
      setData(result);
      setGridOffset(0);
      setSelectedId(result.results[0]?.id ?? null);
    } catch {
      setError("No se encontraron personajes.");
      setData(null);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [page, nameFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const results = data?.results ?? [];
  const visibleCharacters = results.slice(gridOffset, gridOffset + gridSize);

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

  function handleSearch(name: string) {
    setPage(1);
    setNameFilter(name);
  }

  function handleScrollUp() {
    setGridOffset((prev) => Math.max(0, prev - gridSize));
  }

  function handleScrollDown() {
    if (gridOffset + gridSize < results.length) {
      setGridOffset((prev) => prev + gridSize);
      return;
    }
    if (data?.info.next) setPage((p) => p + 1);
  }

  function handleCarouselPrev() {
    if (selectedIndex <= 0) return;
    const next = selectedIndex - 1;
    if (isMobile) setGridOffset(Math.floor(next / MOBILE_GRID) * MOBILE_GRID);
    setSelectedId(results[next].id);
  }

  function handleCarouselNext() {
    if (selectedIndex < results.length - 1) {
      const next = selectedIndex + 1;
      if (isMobile) setGridOffset(Math.floor(next / MOBILE_GRID) * MOBILE_GRID);
      setSelectedId(results[next].id);
      return;
    }
    if (data?.info.next) setPage((p) => p + 1);
  }

  useEffect(() => {
    if (selectedId === null || results.length === 0) return;
    const inVisible = visibleCharacters.some((c) => c.id === selectedId);
    if (inVisible) return;

    if (isMobile) {
      const idx = results.findIndex((c) => c.id === selectedId);
      if (idx !== -1) {
        const nextOffset = Math.floor(idx / MOBILE_GRID) * MOBILE_GRID;
        if (nextOffset !== gridOffset) setGridOffset(nextOffset);
        return;
      }
    }

    const first = visibleCharacters[0];
    if (first) setSelectedId(first.id);
  }, [gridOffset, visibleCharacters, selectedId, isMobile, results]);

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
    setSelectedId,
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
    reload: load,
  };
}
