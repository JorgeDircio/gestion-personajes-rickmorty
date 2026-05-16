"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Character, CharactersResponse, Favorite } from "@/types";
import { fetchCharacters } from "@/services/rickmortyApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
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
import styles from "./page.module.css";

const GRID_SIZE = 4;

export default function HomePage() {
  const dispatch = useAppDispatch();
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
  const visibleCharacters = results.slice(gridOffset, gridOffset + GRID_SIZE);

  const selectedCharacter = useMemo(
    () => results.find((c) => c.id === selectedId) ?? visibleCharacters[0] ?? null,
    [results, selectedId, visibleCharacters]
  );

  const canScrollUp = gridOffset > 0;
  const canScrollDown =
    gridOffset + GRID_SIZE < results.length ||
    Boolean(data?.info.next && gridOffset + GRID_SIZE >= results.length);

  function handleSearch(name: string) {
    setPage(1);
    setNameFilter(name);
  }

  function handleScrollUp() {
    setGridOffset((prev) => Math.max(0, prev - GRID_SIZE));
  }

  async function handleScrollDown() {
    if (gridOffset + GRID_SIZE < results.length) {
      setGridOffset((prev) => prev + GRID_SIZE);
      return;
    }
    if (data?.info.next) {
      setPage((p) => p + 1);
    }
  }

  useEffect(() => {
    const firstVisible = visibleCharacters[0];
    if (
      firstVisible &&
      selectedId !== null &&
      !visibleCharacters.some((c) => c.id === selectedId)
    ) {
      setSelectedId(firstVisible.id);
    }
  }, [gridOffset, visibleCharacters, selectedId]);

  function isFavorite(characterId: number) {
    return favorites.some((f) => f.characterId === characterId);
  }

  function handleToggleFavorite(character: Character) {
    const fav = favorites.find((f) => f.characterId === character.id);
    if (fav) {
      dispatch(removeFavoriteRequest(fav.id));
    } else {
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
            className={styles.bgCharactersImg}
            sizes="100vw"
            suppressHydrationWarning
          />
        </div>
      </div>

      <div className={styles.footer} aria-hidden />

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
          <CharacterDetailPanel character={selectedCharacter} />

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

            <div className={styles.favsSlot}>
              <FavsTab
                favorites={favorites}
                onSelectFavorite={handleSelectFavorite}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
