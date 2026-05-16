const jsonServer = require("json-server");
const path = require("path");

const server = jsonServer.create();
const dbPath = path.join(__dirname, "db.json");
const router = jsonServer.router(dbPath);
const middlewares = jsonServer.defaults();

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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`JSON Server listening on http://localhost:${PORT}`);
});
