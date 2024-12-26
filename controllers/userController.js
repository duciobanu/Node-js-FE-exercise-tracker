import initDb from "../db/db.js";

export const createUser = async (req, res) => {
  const { username } = req.body;
  if (!username) {
    return res.status(400).json({ error: "Username is required" });
  }

  try {
    const db = await initDb();
    const result = await db.run(
      "INSERT INTO users (username) VALUES (?)",
      username
    );
    const user = { id: result.lastID, username };
    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: "Username must be unique or valid" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const db = await initDb();
    const users = await db.all("SELECT id, username FROM users");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve users" });
  }
};
