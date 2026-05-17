"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CharactersResponse } from "@/types";
import { fetchCharacters } from "@/services/rickmortyApi";
import { EMPTY_CHARACTER_RESULTS } from "@/lib/constants";
import type { CharactersQueryState } from "./types";

export function useCharactersQuery(
  onResultsLoaded?: (firstCharacterId: number | null) => void
): CharactersQueryState {
  const [data, setData] = useState<CharactersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");

  const results = useMemo(
    () => data?.results ?? EMPTY_CHARACTER_RESULTS,
    [data]
  );

  const fetchCharactersPage = useCallback(
    async (isCancelled: () => boolean = () => false) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchCharacters({
          page,
          name: nameFilter || undefined,
        });
        if (isCancelled()) return;
        setData(result);
        onResultsLoaded?.(result.results[0]?.id ?? null);
      } catch {
        if (isCancelled()) return;
        setError("No se encontraron personajes.");
        setData(null);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, nameFilter, onResultsLoaded]
  );

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      void fetchCharactersPage(() => cancelled);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchCharactersPage]);

  const reload = useCallback(() => {
    void fetchCharactersPage();
  }, [fetchCharactersPage]);

  function handleSearch(name: string) {
    setPage(1);
    setNameFilter(name);
  }

  function requestNextPage() {
    setPage((current) => current + 1);
  }

  return {
    data,
    loading,
    error,
    results,
    hasNextPage: Boolean(data?.info.next),
    handleSearch,
    reload,
    setData,
    requestNextPage,
  };
}
