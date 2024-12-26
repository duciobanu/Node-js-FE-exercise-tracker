import express from "express";
import { addExercise } from "../controllers/exerciseController.js";
import { getLogs } from "../controllers/exerciseController.js";

const router = express.Router();

router.post("/api/users/:_id/exercises", addExercise);
router.get("/api/users/:_id/logs", getLogs);

export default router;