"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Header.module.css";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          Rick &amp; Morty
        </Link>
        <nav className={styles.nav}>
          <Link
            href="/"
            className={`${styles.link} ${pathname === "/" ? styles.active : ""}`}
          >
            Personajes
          </Link>
          <Link
            href="/favorites"
            className={`${styles.link} ${pathname === "/favorites" ? styles.active : ""}`}
          >
            Favoritos
          </Link>
        </nav>
      </div>
    </header>
  );
}
