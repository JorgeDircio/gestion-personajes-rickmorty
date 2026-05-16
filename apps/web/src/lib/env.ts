export const ENV = {
  JSON_SERVER_URL:
    process.env.NEXT_PUBLIC_JSON_SERVER_URL ?? "http://localhost:3001",
  RICK_MORTY_API_URL: "https://rickandmortyapi.com/api",
} as const;
