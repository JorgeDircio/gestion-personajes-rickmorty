"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { CharactersResponse } from "@/types";
import { fetchCharacters } from "@/services/rickmortyApi";
import { EMPTY_CHARACTER_RESULTS } from "@/lib/constants";
import type { CharactersQueryState, PageNavigation } from "./types";

export function useCharactersQuery(
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
  const pageNavigationRef = useRef<PageNavigation>("initial");

  const results = useMemo(
    () => data?.results ?? EMPTY_CHARACTER_RESULTS,
    [data]
  );

  const consumePageNavigation = useCallback(() => {
    const direction = pageNavigationRef.current;
    pageNavigationRef.current = "initial";
    return direction;
  }, []);

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
      } catch {
        if (isCancelled()) return;
        setError("No se encontraron personajes.");
        setData(null);
      } finally {
        if (!isCancelled()) setLoading(false);
      }
    },
    [page, nameFilter]
  );

  useEffect(() => {
    if (skipInitialFetchRef.current && page === 1 && !nameFilter) {
      skipInitialFetchRef.current = false;
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      void fetchCharactersPage(() => cancelled);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchCharactersPage, page, nameFilter]);

  const reload = useCallback(() => {
    void fetchCharactersPage();
  }, [fetchCharactersPage]);

  const handleSearch = useCallback(
    (name: string) => {
      startSearchTransition(() => {
        pageNavigationRef.current = "forward";
        setPage(1);
        setNameFilter(name);
      });
    },
    [startSearchTransition]
  );

  const requestNextPage = useCallback(() => {
    pageNavigationRef.current = "forward";
    setPage((current) => current + 1);
  }, []);

  const requestPrevPage = useCallback(() => {
    pageNavigationRef.current = "backward";
    setPage((current) => Math.max(1, current - 1));
  }, []);

  return {
    data,
    loading,
    error,
    results,
    page,
    hasNextPage: Boolean(data?.info.next),
    hasPrevPage: page > 1,
    searchPending: isSearchPending,
    handleSearch,
    reload,
    setData,
    requestNextPage,
    requestPrevPage,
    consumePageNavigation,
  };
}
