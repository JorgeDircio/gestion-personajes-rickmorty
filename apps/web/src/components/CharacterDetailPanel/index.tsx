"use client";

import Image from "next/image";
import { Character } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import styles from "./CharacterDetailPanel.module.css";

interface Props {
  character: Character | null;
}

function formatGender(gender: Character["gender"]) {
  const map: Record<Character["gender"], string> = {
    Male: "Male",
    Female: "Female",
    Genderless: "Genderless",
    unknown: "Unknown",
  };
  return map[gender] ?? gender;
}

export default function CharacterDetailPanel({ character }: Props) {
  if (!character) {
    return (
      <section className={styles.panel}>
        <div className={styles.placeholder}>Selecciona un personaje</div>
      </section>
    );
  }

  return (
    <section className={styles.panel}>
      <div className={styles.imageWrap}>
        <Image
          src={character.image}
          alt={character.name}
          fill
          sizes="(min-width: 1025px) 50vw, 94vw"
          quality={90}
          className={styles.image}
          priority
          suppressHydrationWarning
        />
        <div className={styles.imageVignette} aria-hidden />
      </div>
      <div className={styles.status}>
        <StatusBadge status={character.status} variant="hero" />
      </div>
      <footer className={styles.footer}>
        <div className={styles.identity}>
          <h2 className={styles.name}>{character.name}</h2>
          <p className={styles.species}>{character.species}</p>
          {character.type ? (
            <p className={styles.typeLine}>{character.type}</p>
          ) : null}
        </div>
        <dl className={styles.stats}>
          <div className={styles.stat}>
            <dt>Origin</dt>
            <dd>{character.origin.name}</dd>
          </div>
          <div className={styles.stat}>
            <dt>Location</dt>
            <dd>{character.location.name}</dd>
          </div>
          <div className={styles.stat}>
            <dt>Gender</dt>
            <dd>{formatGender(character.gender)}</dd>
          </div>
          <div className={styles.stat}>
            <dt>Episodes</dt>
            <dd>{character.episode.length}</dd>
          </div>
        </dl>
      </footer>
    </section>
  );
}
