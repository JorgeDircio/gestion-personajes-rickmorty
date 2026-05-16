import type { Metadata } from "next";
import { Bebas_Neue, Inter, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const robotoCondensed = Roboto_Condensed({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-roboto-condensed",
});

export const metadata: Metadata = {
  title: "Rick & Morty | Gestión de Personajes",
  description: "Explora y gestiona personajes de Rick and Morty",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`${bebas.variable} ${inter.variable} ${robotoCondensed.variable}`}
      suppressHydrationWarning
    >
      <body suppressHydrationWarning>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
