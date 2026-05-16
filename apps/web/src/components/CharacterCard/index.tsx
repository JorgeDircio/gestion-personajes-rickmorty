"use client";

import Image from "next/image";
import Link from "next/link";
import { Character } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  addFavoriteRequest,
  removeFavoriteRequest,
} from "@/store/favorites/favoritesSlice";
import StatusBadge from "@/components/StatusBadge";
import FavoriteButton from "@/components/FavoriteButton";
import styles from "./CharacterCard.module.css";

interface Props {
  character: Character;
}

export default function CharacterCard({ character }: Props) {
  const dispatch = useAppDispatch();
  const { items, loading } = useAppSelector((s) => s.favorites);

  const favorite = items.find((f) => f.characterId === character.id);
  const isFavorite = Boolean(favorite);

  function handleFavoriteToggle() {
    if (isFavorite && favorite) {
      dispatch(removeFavoriteRequest(character.id));
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

  return (
    <article className={styles.card}>
      <Link href={`/characters/${character.id}`} className={styles.imageLink}>
        <Image
          src={character.image}
          alt={character.name}
          width={300}
          height={300}
          className={styles.image}
        />
      </Link>
      <div className={styles.body}>
        <Link href={`/characters/${character.id}`} className={styles.name}>
          {character.name}
        </Link>
        <StatusBadge status={character.status} />
        <p className={styles.species}>{character.species}</p>
        <div className={styles.footer}>
          <FavoriteButton
            isFavorite={isFavorite}
            onClick={handleFavoriteToggle}
            disabled={loading}
          />
        </div>
      </div>
    </article>
  );
}
