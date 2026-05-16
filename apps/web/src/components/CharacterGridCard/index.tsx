"use client";

import Image from "next/image";
import { Character } from "@/types";
import styles from "./CharacterGridCard.module.css";

interface Props {
  character: Character;
  isSelected: boolean;
  isFavorite: boolean;
  disabled?: boolean;
  onSelect: () => void;
  onToggleFavorite: () => void;
}

export default function CharacterGridCard({
  character,
  isSelected,
  isFavorite,
  disabled,
  onSelect,
  onToggleFavorite,
}: Props) {
  const displayName = character.name.split(" ")[0].toUpperCase();

  return (
    <div className={styles.cardShell}>
      <article
        className={`${styles.card} ${isSelected ? styles.selected : ""}`}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={isSelected}
        aria-label={`Seleccionar ${character.name}`}
      >
        <h3 className={styles.name}>{displayName}</h3>
        <div className={styles.imageWrap}>
          <Image
            src={character.image}
            alt={character.name}
            fill
            sizes="(min-width: 1024px) 10vw, 25vw"
            className={styles.image}
            suppressHydrationWarning
          />
        </div>
        <button
          type="button"
          className={`${styles.like} ${isFavorite ? styles.likeActive : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          disabled={disabled}
          aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
        >
          <span className={styles.heartIcon} aria-hidden />
          Like
        </button>
      </article>
    </div>
  );
}

