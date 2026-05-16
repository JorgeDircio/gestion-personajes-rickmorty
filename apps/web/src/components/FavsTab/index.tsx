"use client";

import { useState, useRef, useEffect } from "react";
import { Favorite } from "@/types";
import styles from "./FavsTab.module.css";

const MAX_FAVS = 4;

interface Props {
  favorites: Favorite[];
  onSelectFavorite: (favorite: Favorite) => void;
  onRemoveFavorite: (favoriteId: number) => void;
}

export default function FavsTab({
  favorites,
  onSelectFavorite,
  onRemoveFavorite,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listed = favorites.slice(0, MAX_FAVS);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1025px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      className={`${styles.wrapper} ${isDesktop ? styles.wrapperDesktop : ""}`}
      ref={rootRef}
    >
      <button
        type="button"
        className={`${styles.tab} ${isDesktop ? styles.tabDesktop : ""} ${open ? styles.tabOpen : ""}`}
        style={
          isDesktop
            ? {
                borderTopLeftRadius: 10,
                borderTopRightRadius: 10,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
              }
            : undefined
        }
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        FAVS
      </button>
      {open && (
        <ul className={styles.dropdown} role="listbox">
          {listed.length === 0 ? (
            <li className={styles.empty}>Sin favoritos</li>
          ) : (
            listed.map((fav) => (
              <li key={fav.id} className={styles.row}>
                <button
                  type="button"
                  className={styles.item}
                  role="option"
                  onClick={() => {
                    onSelectFavorite(fav);
                    setOpen(false);
                  }}
                >
                  {fav.name.split(" ")[0].toUpperCase()}
                </button>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Eliminar ${fav.name}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFavorite(fav.id);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden
                  >
                    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
