"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Character, CharactersResponse, Favorite } from "@/types";
import { fetchCharacters } from "@/services/rickmortyApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useIsMobile } from "@/hooks/useIsMobile";
import {
  addFavoriteRequest,
  fetchFavoritesRequest,
  removeFavoriteRequest,
} from "@/store/favorites/favoritesSlice";
import CharacterDetailPanel from "@/components/CharacterDetailPanel";
import CharacterGridCard from "@/components/CharacterGridCard";
import SearchBar from "@/components/SearchBar";
import ScrollControls from "@/components/ScrollControls";
import FavsTab from "@/components/FavsTab";
import SceneFooter from "@/components/SceneFooter";
import styles from "./page.module.css";

const DESKTOP_GRID = 4;
const MOBILE_GRID = 2;
const MAX_FAVS = 4;

export default function HomePage() {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const gridSize = isMobile ? MOBILE_GRID : DESKTOP_GRID;
  const { items: favorites, loading: favoritesLoading } = useAppSelector(
    (s) => s.favorites
  );

  const [data, setData] = useState<CharactersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [nameFilter, setNameFilter] = useState("");
  const [gridOffset, setGridOffset] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchFavoritesRequest());
  }, [dispatch]);

  const loadCharacters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchCharacters({
        page,
        name: nameFilter || undefined,
      });
      setData(result);
      setGridOffset(0);
      const first = result.results[0];
      setSelectedId(first?.id ?? null);
    } catch {
      setError("No se encontraron personajes.");
      setData(null);
      setSelectedId(null);
    } finally {
      setLoading(false);
    }
  }, [page, nameFilter]);

  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  const results = data?.results ?? [];
  const visibleCharacters = results.slice(gridOffset, gridOffset + gridSize);

  const selectedCharacter = useMemo(
    () => results.find((c) => c.id === selectedId) ?? visibleCharacters[0] ?? null,
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

  function handleSearch(name: string) {
    setPage(1);
    setNameFilter(name);
  }

  function handleScrollUp() {
    setGridOffset((prev) => Math.max(0, prev - gridSize));
  }

  async function handleScrollDown() {
    if (gridOffset + gridSize < results.length) {
      setGridOffset((prev) => prev + gridSize);
      return;
    }
    if (data?.info.next) {
      setPage((p) => p + 1);
    }
  }

  function syncMobileGridToIndex(index: number) {
    if (!isMobile || index < 0) return;
    const nextOffset = Math.floor(index / MOBILE_GRID) * MOBILE_GRID;
    setGridOffset(nextOffset);
  }

  function handleCarouselPrev() {
    if (selectedIndex > 0) {
      const nextIndex = selectedIndex - 1;
      syncMobileGridToIndex(nextIndex);
      setSelectedId(results[nextIndex].id);
    }
  }

  async function handleCarouselNext() {
    if (selectedIndex < results.length - 1) {
      const nextIndex = selectedIndex + 1;
      syncMobileGridToIndex(nextIndex);
      setSelectedId(results[nextIndex].id);
      return;
    }
    if (data?.info.next) {
      setPage((p) => p + 1);
    }
  }

  useEffect(() => {
    if (selectedId === null || results.length === 0) return;

    const inVisible = visibleCharacters.some((c) => c.id === selectedId);
    if (inVisible) return;

    if (isMobile) {
      const idx = results.findIndex((c) => c.id === selectedId);
      if (idx !== -1) {
        const nextOffset = Math.floor(idx / MOBILE_GRID) * MOBILE_GRID;
        if (nextOffset !== gridOffset) {
          setGridOffset(nextOffset);
        }
        return;
      }
    }

    const firstVisible = visibleCharacters[0];
    if (firstVisible) {
      setSelectedId(firstVisible.id);
    }
  }, [gridOffset, visibleCharacters, selectedId, isMobile, results]);

  function isFavorite(characterId: number) {
    return favorites.some((f) => f.characterId === characterId);
  }

  function handleToggleFavorite(character: Character) {
    const fav = favorites.find((f) => f.characterId === character.id);
    if (fav) {
      dispatch(removeFavoriteRequest(fav.id));
    } else if (favorites.length < MAX_FAVS) {
      dispatch(
        addFavoriteRequest({
          characterId: character.id,
          name: character.name,
          image: character.image,
          status: character.status,
          species: character.species,
        })
      );
    }
  }

  function handleSelectFavorite(fav: Favorite) {
    const inList = results.find((c) => c.id === fav.characterId);
    if (inList) {
      setSelectedId(fav.characterId);
      return;
    }
    setSelectedId(fav.characterId);
    setData({
      info: { count: 1, pages: 1, next: null, prev: null },
      results: [
        {
          id: fav.characterId,
          name: fav.name,
          status: fav.status,
          species: fav.species,
          type: "",
          gender: "unknown",
          origin: { name: "—", url: "" },
          location: { name: "—", url: "" },
          image: fav.image,
          episode: [],
          url: "",
          created: "",
        },
      ],
    });
    setGridOffset(0);
  }

  function handleRemoveFavorite(favoriteId: number) {
    dispatch(removeFavoriteRequest(favoriteId));
  }

  return (
    <div className={styles.scene}>
      <div className={styles.bgViewport} aria-hidden>
        <div className={styles.bgStars}>
          <Image
            src="/images/rick-morty-start.svg"
            alt=""
            fill
            unoptimized
            priority
            className={styles.bgStarsImg}
            sizes="100vw"
            suppressHydrationWarning
          />
        </div>
        <div className={styles.bgCharacters}>
          <Image
            src="/images/rick-morty-characters.svg"
            alt=""
            fill
            unoptimized
            priority
            className={`${styles.bgCharactersImg} ${styles.bgCharactersImgDesktop}`}
            sizes="100vw"
            suppressHydrationWarning
          />
          <Image
            src="/images/rick-morty-minimal-night.svg"
            alt=""
            fill
            unoptimized
            priority
            className={`${styles.bgCharactersImg} ${styles.bgCharactersImgMobile}`}
            sizes="100vw"
            suppressHydrationWarning
          />
        </div>
      </div>

      <SceneFooter>
        <FavsTab
          favorites={favorites}
          onSelectFavorite={handleSelectFavorite}
          onRemoveFavorite={handleRemoveFavorite}
        />
      </SceneFooter>

      <div className={styles.figmaCanvas}>
        <div className={styles.logo}>
          <Image
            src="/images/rick_and_morty.svg"
            alt="Rick and Morty"
            fill
            unoptimized
            priority
            suppressHydrationWarning
          />
        </div>

        <div className={styles.panel}>
          <div className={styles.detailRegion}>
            <CharacterDetailPanel character={selectedCharacter} />
            <div className={styles.carouselNav} aria-label="Navegación de personajes">
              <button
                type="button"
                className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
                onClick={handleCarouselPrev}
                disabled={!canCarouselPrev}
                aria-label="Personaje anterior"
              >
                <svg
                  className={styles.carouselIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  suppressHydrationWarning
                >
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button
                type="button"
                className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
                onClick={handleCarouselNext}
                disabled={!canCarouselNext && !data?.info.next}
                aria-label="Personaje siguiente"
              >
                <svg
                  className={styles.carouselIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  suppressHydrationWarning
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.searchWrap}>
              <SearchBar onSearch={handleSearch} />
            </div>

            {loading && (
              <p className={styles.message}>Cargando personajes...</p>
            )}
            {error && !loading && (
              <p className={styles.message}>{error}</p>
            )}
            {!loading && !error && (
              <div className={styles.gridStack}>
                  <div className={styles.grid}>
                    {visibleCharacters.map((character) => (
                      <CharacterGridCard
                        key={character.id}
                        character={character}
                        isSelected={character.id === selectedCharacter?.id}
                        isFavorite={isFavorite(character.id)}
                        disabled={favoritesLoading}
                        onSelect={() => setSelectedId(character.id)}
                        onToggleFavorite={() =>
                          handleToggleFavorite(character)
                        }
                      />
                    ))}
                  </div>
                  <ScrollControls
                    className={styles.scrollControls}
                    onUp={handleScrollUp}
                    onDown={handleScrollDown}
                    canScrollUp={canScrollUp}
                    canScrollDown={canScrollDown}
                  />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
