"use client";

import Image from "next/image";
import { useCharacterScene } from "@/hooks/useCharacterScene";
import { useFavoriteActions } from "@/hooks/useFavoriteActions";
import CharacterDetailPanel from "@/components/CharacterDetailPanel";
import CharacterCarouselNav from "@/components/CharacterCarouselNav";
import CharacterBrowsePanel from "@/components/CharacterBrowsePanel";
import SceneBackground from "@/components/SceneBackground";
import FavsTab from "@/components/FavsTab";
import SceneFooter from "@/components/SceneFooter";
import styles from "@/app/page.module.css";

export default function HomeScene() {
  const scene = useCharacterScene();
  const favorites = useFavoriteActions({
    results: scene.results,
    setSelectedId: scene.selectCharacter,
    showCharacterPreview: scene.showCharacterPreview,
    reload: scene.reload,
  });

  return (
    <div className={styles.scene}>
      <SceneBackground />

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
            <CharacterDetailPanel character={scene.selectedCharacter} />
            <CharacterCarouselNav
              onPrev={scene.handleCarouselPrev}
              onNext={scene.handleCarouselNext}
              canPrev={scene.canCarouselPrev}
              canNext={scene.canCarouselNext || scene.hasNextPage}
            />
          </div>

          <CharacterBrowsePanel
            loading={scene.loading}
            error={scene.error}
            visibleCharacters={scene.visibleCharacters}
            selectedCharacter={scene.selectedCharacter}
            favoritesLoading={favorites.favoritesLoading}
            isFavorite={favorites.isFavorite}
            onSearch={scene.handleSearch}
            onSelectCharacter={scene.selectCharacter}
            onToggleFavorite={favorites.handleToggleFavorite}
            onScrollUp={scene.handleScrollUp}
            onScrollDown={scene.handleScrollDown}
            canScrollUp={scene.canScrollUp}
            canScrollDown={scene.canScrollDown}
          />
        </div>
      </div>
    </div>
  );
}
