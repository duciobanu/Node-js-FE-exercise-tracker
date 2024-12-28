import initDb from "../db/db.js";

export const addExercise = async (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  if (!description || !duration) {
    return res
      .status(400)
      .json({ error: "Description and duration are required" });
  }

  const parsedDuration = parseInt(duration, 10);
  if (isNaN(parsedDuration) || parsedDuration <= 0) {
    return res
      .status(400)
      .json({ error: "Duration must be a positive number" });
  }

  const isValidDate = (dateString) => {
    const dateObj = new Date(dateString);
    return (
      !isNaN(dateObj.getTime()) &&
      dateString === dateObj.toISOString().split("T")[0]
    );
  };

  const exerciseDate = date
    ? isValidDate(date)
      ? date
      : null
    : new Date().toISOString().split("T")[0];

  if (!exerciseDate) {
    return res
      .status(400)
      .json({ error: "Invalid date format, expected YYYY-MM-DD" });
  }

  try {
    const db = await initDb();
    const user = await db.get("SELECT * FROM users WHERE id = ?", _id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const result = await db.run(
      `INSERT INTO exercises (user_id, description, duration, date)
       VALUES (?, ?, ?, ?)`,
      [_id, description, parsedDuration, exerciseDate]
    );

    const exercise = {
      userId: _id,
      exerciseId: result.lastID,
      description,
      duration: parsedDuration,
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
      ORDER BY date ASC
    `;
    const params = [_id];

    const allLogs = await db.all(query, params);

    let filteredLogs = allLogs;
    if (from) {
      filteredLogs = filteredLogs.filter((log) => log.date >= from);
    }
    if (to) {
      filteredLogs = filteredLogs.filter((log) => log.date <= to);
    }

    const totalCount = filteredLogs.length;

    if (limit) {
      filteredLogs = filteredLogs.slice(0, parseInt(limit, 10));
    }

    res.json({
      id: user.id,
      username: user.username,
      count: totalCount,
      logs: filteredLogs,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to retrieve logs" });
  }
};
