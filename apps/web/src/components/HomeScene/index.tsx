"use client";

import { memo, useMemo } from "react";
import Image from "next/image";
import { CharactersResponse } from "@/types";
import { useCharacterScene } from "@/hooks/useCharacterScene";
import { useFavoriteActions } from "@/hooks/useFavoriteActions";
import CharacterDetailPanel from "@/components/CharacterDetailPanel";
import CharacterCarouselNav from "@/components/CharacterCarouselNav";
import CharacterBrowsePanel from "@/components/CharacterBrowsePanel";
import SceneBackground from "@/components/SceneBackground";
import FavsTab from "@/components/FavsTab";
import SceneFooter from "@/components/SceneFooter";
import styles from "./HomeScene.module.css";

const MemoCharacterDetailPanel = memo(CharacterDetailPanel);
const MemoCharacterBrowsePanel = memo(CharacterBrowsePanel);

interface Props {
  initialCharacters?: CharactersResponse | null;
}

export default function HomeScene({ initialCharacters = null }: Props) {
  const scene = useCharacterScene(initialCharacters);
  const favorites = useFavoriteActions({
    results: scene.results,
    selectCharacter: scene.selectCharacter,
    showCharacterPreview: scene.showCharacterPreview,
    reload: scene.reload,
  });

  const networkMessage = scene.error ?? favorites.favoritesError;

  const browsePanelProps = useMemo(
    () => ({
      loading: scene.loading,
      error: scene.error,
      visibleCharacters: scene.visibleCharacters,
      selectedCharacter: scene.selectedCharacter,
      favoritesLoading: favorites.favoritesLoading,
      isFavorite: favorites.isFavorite,
      searchPending: scene.searchPending,
      onSearch: scene.handleSearch,
      onSelectCharacter: scene.selectCharacter,
      onToggleFavorite: favorites.handleToggleFavorite,
      onScrollUp: scene.handleScrollUp,
      onScrollDown: scene.handleScrollDown,
      canScrollUp: scene.canScrollUp,
      canScrollDown: scene.canScrollDown,
    }),
    [
      scene.loading,
      scene.error,
      scene.visibleCharacters,
      scene.selectedCharacter,
      scene.searchPending,
      scene.handleSearch,
      scene.selectCharacter,
      scene.handleScrollUp,
      scene.handleScrollDown,
      scene.canScrollUp,
      scene.canScrollDown,
      favorites.favoritesLoading,
      favorites.isFavorite,
      favorites.handleToggleFavorite,
    ]
  );

  return (
    <div className={styles.scene}>
      <SceneBackground />

      {networkMessage ? (
        <p className={styles.networkAlert} role="alert">
          {networkMessage}
        </p>
      ) : null}

      <SceneFooter>
        <FavsTab
          favorites={favorites.favorites}
          onSelectFavorite={favorites.handleSelectFavorite}
          onRemoveFavorite={favorites.handleRemoveFavorite}
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
            <MemoCharacterDetailPanel character={scene.selectedCharacter} />
            <CharacterCarouselNav
              onPrev={scene.handleCarouselPrev}
              onNext={scene.handleCarouselNext}
              canPrev={scene.canCarouselPrev}
              canNext={scene.canCarouselNext || scene.hasNextPage}
            />
          </div>

          <MemoCharacterBrowsePanel {...browsePanelProps} />
        </div>
      </div>
    </div>
  );
}
