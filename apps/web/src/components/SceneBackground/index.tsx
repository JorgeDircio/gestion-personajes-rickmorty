import Image from "next/image";
import styles from "./SceneBackground.module.css";

export default function SceneBackground() {
  return (
    <div className={styles.bgViewport} aria-hidden>
      <div className={styles.bgStars}>
        <Image
          src="/images/rick-morty-start.svg"
          alt=""
          fill
          unoptimized
          priority
          className={styles.bgStarsImg}
          sizes="100vw"
          suppressHydrationWarning
        />
      </div>
      <div className={styles.bgCharacters}>
        <Image
          src="/images/rick-morty-characters.svg"
          alt=""
          fill
          unoptimized
          priority
          className={`${styles.bgCharactersImg} ${styles.bgCharactersImgDesktop}`}
          sizes="100vw"
          suppressHydrationWarning
        />
        <Image
          src="/images/rick-morty-minimal-night.svg"
          alt=""
          fill
          unoptimized
          priority
          className={`${styles.bgCharactersImg} ${styles.bgCharactersImgMobile}`}
          sizes="100vw"
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}
