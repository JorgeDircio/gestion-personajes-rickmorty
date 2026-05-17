/** Base URL del JSON Server. Por defecto usa el proxy de Next (mismo origen). */
export const ENV = {
  JSON_SERVER_URL:
    process.env.NEXT_PUBLIC_JSON_SERVER_URL ?? "/api/json-server",
  RICK_MORTY_API_URL: "https://rickandmortyapi.com/api",
} as const;
