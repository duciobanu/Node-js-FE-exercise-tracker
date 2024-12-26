import initDb from "../db/db.js";

export const addExercise = async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!description || !duration) {
    return res
      .status(400)
      .json({ error: "Description and duration are required" });
  }

  const exerciseDate = date || new Date().toISOString().split("T")[0];

  try {
    const db = await initDb();
    const user = await db.get("SELECT * FROM users WHERE id = ?", _id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await db.run(
      `INSERT INTO exercises (user_id, description, duration, date)
       VALUES (?, ?, ?, ?)`,
      [_id, description, parseInt(duration, 10), exerciseDate]
    );

    const exercise = {
      userId: _id,
      exerciseId: result.lastID,
      description,
      duration: parseInt(duration, 10),
      date: exerciseDate,
    };

    res.status(201).json(exercise);
  } catch (err) {
    res.status(500).json({ error: "Failed to add exercise" });
  }
};

export const getLogs = async (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  try {
    const db = await initDb();
    const user = await db.get(
      "SELECT id, username FROM users WHERE id = ?",
      _id
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let query = `
      SELECT id, description, duration, date
      FROM exercises
      WHERE user_id = ?
    `;
    const params = [_id];

    if (from) {
      query += " AND date >= ?";
      params.push(from);
    }
    if (to) {
      query += " AND date <= ?";
      params.push(to);
    }
    if (limit) {
      query += " LIMIT ?";
      params.push(parseInt(limit, 10));
    }

    const logs = await db.all(query, params);
    const count = await db.get(
      `SELECT COUNT(*) as count FROM exercises WHERE user_id = ?`,
      [_id]
    );

    res.json({
      id: user.id,
      username: user.username,
      count: count.count,
      logs,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve logs" });
  }
};
