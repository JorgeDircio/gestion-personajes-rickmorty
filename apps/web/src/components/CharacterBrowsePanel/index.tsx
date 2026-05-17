import { Character } from "@/types";
import CharacterGridCard from "@/components/CharacterGridCard";
import SearchBar from "@/components/SearchBar";
import ScrollControls from "@/components/ScrollControls";
import styles from "./CharacterBrowsePanel.module.css";

interface Props {
  loading: boolean;
  error: string | null;
  visibleCharacters: Character[];
  selectedCharacter: Character | null;
  favoritesLoading: boolean;
  isFavorite: (characterId: number) => boolean;
  onSearch: (name: string) => void;
  onSelectCharacter: (id: number) => void;
  onToggleFavorite: (character: Character) => void;
  onScrollUp: () => void;
  onScrollDown: () => void;
  canScrollUp: boolean;
  canScrollDown: boolean;
}

export default function CharacterBrowsePanel({
  loading,
  error,
  visibleCharacters,
  selectedCharacter,
  favoritesLoading,
  isFavorite,
  onSearch,
  onSelectCharacter,
  onToggleFavorite,
  onScrollUp,
  onScrollDown,
  canScrollUp,
  canScrollDown,
}: Props) {
  return (
    <div className={styles.right}>
      <div className={styles.searchWrap}>
        <SearchBar onSearch={onSearch} />
      </div>

      {loading && <p className={styles.message}>Cargando personajes...</p>}
      {error && !loading && <p className={styles.message}>{error}</p>}

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
                onSelect={() => onSelectCharacter(character.id)}
                onToggleFavorite={() => onToggleFavorite(character)}
              />
            ))}
          </div>
          <ScrollControls
            className={styles.scrollControls}
            onUp={onScrollUp}
            onDown={onScrollDown}
            canScrollUp={canScrollUp}
            canScrollDown={canScrollDown}
          />
        </div>
      )}
    </div>
  );
}
