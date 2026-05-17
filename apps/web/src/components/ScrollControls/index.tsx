"use client";

import styles from "./ScrollControls.module.css";

interface Props {
  className?: string;
  onUp: () => void;
  onDown: () => void;
  canScrollUp: boolean;
  canScrollDown: boolean;
}

export default function ScrollControls({
  className,
  onUp,
  onDown,
  canScrollUp,
  canScrollDown,
}: Props) {
  return (
    <div className={[styles.controls, className].filter(Boolean).join(" ")}>
      <button
        type="button"
        className={styles.btn}
        onClick={onUp}
        disabled={!canScrollUp}
        aria-label="Ver personajes anteriores"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          suppressHydrationWarning
        >
          <path d="M6 14l6-6 6 6" suppressHydrationWarning />
        </svg>
      </button>
      <button
        type="button"
        className={styles.btn}
        onClick={onDown}
        disabled={!canScrollDown}
        aria-label="Ver más personajes"
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          suppressHydrationWarning
        >
          <path d="M6 10l6 6 6-6" suppressHydrationWarning />
        </svg>
      </button>
    </div>
  );
}
