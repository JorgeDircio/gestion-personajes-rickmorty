"use client";

import { useState } from "react";
import styles from "./SearchBar.module.css";

interface Props {
  onSearch: (name: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [name, setName] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(name.trim());
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <span className={styles.icon} aria-hidden suppressHydrationWarning>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          suppressHydrationWarning
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M20 20l-3-3" />
        </svg>
      </span>
      <input
        className={styles.input}
        type="search"
        placeholder="Find your character..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Buscar personaje"
      />
    </form>
  );
}
