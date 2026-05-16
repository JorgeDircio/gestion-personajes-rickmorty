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
          <svg
            className={styles.heartSvg}
            viewBox="0 0 24 24"
            aria-hidden
            suppressHydrationWarning
          >
            <path
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
              d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            />
          </svg>
          Like
        </button>
      </article>
    </div>
  );
}

