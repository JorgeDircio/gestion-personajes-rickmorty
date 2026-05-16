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

  const subtitle = [character.species, character.type]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <section className={styles.panel}>
      <div className={styles.imageWrap}>
        <Image
          src={character.image}
          alt={character.name}
          fill
          sizes="(min-width: 1024px) 42vw, 100vw"
          className={styles.image}
          priority
          suppressHydrationWarning
        />
        <div className={styles.status}>
          <StatusBadge status={character.status} variant="hero" />
        </div>
        <div className={styles.dataBox}>
          <h2 className={styles.name}>{character.name}</h2>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
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
        </div>
      </div>
    </section>
  );
}
