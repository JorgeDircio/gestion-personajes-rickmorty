const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const dbPath = path.join(__dirname, "db.json");
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "127.0.0.1";

server.use(middlewares);
server.use(jsonServer.bodyParser);

server.delete("/favorites/by-character/:characterId", (req, res) => {
  const characterId = Number(req.params.characterId);
  if (Number.isNaN(characterId)) {
    res.status(400).json({ error: "Invalid characterId" });
    return;
  }

  const db = router.db;
  const favorites = db.get("favorites").value();
  const next = favorites.filter((f) => f.characterId !== characterId);

  if (next.length === favorites.length) {
    res.status(404).json({ error: "Favorite not found" });
    return;
  }

  db.set("favorites", next).write();
  res.status(204).end();
});

server.use(router);

const httpServer = server.listen(PORT, HOST, () => {
  console.log(`JSON Server listening on http://${HOST}:${PORT}`);
});

httpServer.on("error", (err) => {
  if (err.code === "EADDRINUSE") {
    console.error(
      `\nPuerto ${PORT} en uso. Opciones:\n` +
        `  • Liberar el puerto: lsof -ti :${PORT} | xargs kill\n` +
        `  • Usar otro puerto: PORT=3002 pnpm run dev:api\n`
    );
    process.exit(1);
  }
  console.error(err);
  process.exit(1);
});
