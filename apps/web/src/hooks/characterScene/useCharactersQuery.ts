"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CharactersResponse } from "@/types";
import { fetchCharacters } from "@/services/rickmortyApi";
import { EMPTY_CHARACTER_RESULTS } from "@/lib/constants";
import type { CharactersQueryState } from "./types";

export function useCharactersQuery(
  onResultsLoaded?: (firstCharacterId: number | null) => void,
  initialData?: CharactersResponse | null
): CharactersQueryState {
  const [isSearchPending, startSearchTransition] = useTransition();
  const [data, setData] = useState<CharactersResponse | null>(
    initialData ?? null
  );
  const [loading, setLoading] = useState(initialData == null);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const skipInitialFetchRef = useRef(initialData != null);
  const initialFirstCharacterIdRef = useRef(
    initialData?.results[0]?.id ?? null
  );

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
    if (skipInitialFetchRef.current && page === 1 && !nameFilter) {
      skipInitialFetchRef.current = false;
      queueMicrotask(() => {
        onResultsLoaded?.(initialFirstCharacterIdRef.current);
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      void fetchCharactersPage(() => cancelled);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchCharactersPage, page, nameFilter, onResultsLoaded]);

  const reload = useCallback(() => {
    void fetchCharactersPage();
  }, [fetchCharactersPage]);

  const handleSearch = useCallback(
    (name: string) => {
      startSearchTransition(() => {
        setPage(1);
        setNameFilter(name);
      });
    },
    [startSearchTransition]
  );

  function requestNextPage() {
    setPage((current) => current + 1);
  }

  return {
    data,
    loading,
    error,
    results,
    hasNextPage: Boolean(data?.info.next),
    searchPending: isSearchPending,
    handleSearch,
    reload,
    setData,
    requestNextPage,
  };
}
