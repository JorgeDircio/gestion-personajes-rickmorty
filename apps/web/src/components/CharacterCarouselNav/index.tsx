import styles from "@/app/page.module.css";

interface Props {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export default function CharacterCarouselNav({
  onPrev,
  onNext,
  canPrev,
  canNext,
}: Props) {
  return (
    <div className={styles.carouselNav} aria-label="Navegación de personajes">
      <button
        type="button"
        className={`${styles.carouselBtn} ${styles.carouselBtnPrev}`}
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Personaje anterior"
      >
        <svg
          className={styles.carouselIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          suppressHydrationWarning
        >
          <path d="M15 6l-6 6 6 6" />
        </svg>
      </button>
      <button
        type="button"
        className={`${styles.carouselBtn} ${styles.carouselBtnNext}`}
        onClick={onNext}
        disabled={!canNext}
        aria-label="Personaje siguiente"
      >
        <svg
          className={styles.carouselIcon}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          suppressHydrationWarning
        >
          <path d="M9 6l6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}
