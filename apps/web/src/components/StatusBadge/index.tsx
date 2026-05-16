import { CharacterStatus } from "@/types";
import styles from "./StatusBadge.module.css";

interface Props {
  status: CharacterStatus;
  variant?: "default" | "hero";
}

const LABELS: Record<CharacterStatus, string> = {
  Alive: "VIVO",
  Dead: "MUERTO",
  unknown: "DESCONOCIDO",
};

const HERO_LABELS: Record<CharacterStatus, string> = {
  Alive: "LIVE",
  Dead: "DEAD",
  unknown: "UNKNOWN",
};

export default function StatusBadge({ status, variant = "default" }: Props) {
  const statusKey = status.toLowerCase() as "alive" | "dead" | "unknown";
  const label = variant === "hero" ? HERO_LABELS[status] : LABELS[status];
  const isHero = variant === "hero";

  return (
    <span
      className={`${styles.badge} ${styles[statusKey]} ${
        isHero ? styles.hero : ""
      }`}
    >
      {isHero && status === "Alive" ? (
        <span className={styles.statusIcon} aria-hidden />
      ) : (
        <span className={styles.dot} />
      )}
      {isHero ? (
        <span className={styles.heroLabel}>{label}</span>
      ) : (
        label
      )}
    </span>
  );
}
