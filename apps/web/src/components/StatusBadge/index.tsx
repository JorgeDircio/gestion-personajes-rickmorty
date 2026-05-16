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

  return (
    <span
      className={`${styles.badge} ${styles[statusKey]} ${
        variant === "hero" ? styles.hero : ""
      }`}
    >
      <span className={styles.dot} />
      {label}
    </span>
  );
}
