"use client";

import { useState, useRef, useEffect } from "react";
import { Favorite } from "@/types";
import styles from "./FavsTab.module.css";

interface Props {
  favorites: Favorite[];
  onSelectFavorite: (favorite: Favorite) => void;
}

export default function FavsTab({ favorites, onSelectFavorite }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

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
    <div className={styles.wrapper} ref={rootRef}>
      <button
        type="button"
        className={`${styles.tab} ${open ? styles.tabOpen : ""}`}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        FAVS
      </button>
      {open && (
        <ul className={styles.dropdown} role="listbox">
          {favorites.length === 0 ? (
            <li className={styles.empty}>Sin favoritos</li>
          ) : (
            favorites.map((fav) => (
              <li key={fav.id}>
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
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
