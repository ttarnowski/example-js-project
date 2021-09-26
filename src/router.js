import { Router } from "express";
import { join, dirname } from "path";
import { Low, JSONFile } from "lowdb";
import { fileURLToPath } from "url";
import { nanoid } from "nanoid";

const __dirname = dirname(fileURLToPath(import.meta.url));

// use JSON file for storage
const file = join(__dirname, "db.json");
const adapter = new JSONFile(file);

// init db
const db = new Low(adapter);
(async () => {
  console.log("initializing lowdb");

  await db.read();

  if (!db.data) {
    console.log("no db structure found, setting users...");
    db.data = { users: [] };
  }

  await db.write();
})();

const getUsers = async () => {
  await db.read();

  return db.users;
};

const insertUser = async (user) => {
  db.data.users.push(user);

  await db.write();
};

const router = new Router();

router.get("/users", async (req, res) => {
  res.send(await getUsers());
});

router.get("/user/:id", async (req, res) => {
  const user = await getUsers().find((user) => user.id === req.params.id);

  if (!user) {
    res.sendStatus(404);
    return;
  }

  res.send(user);
});

router.post("/user", async (req, res) => {
  await insertUser({
    id: nanoid(),
    ...req.body.user,
  });

  res.sendStatus(201);
});

export default router;
