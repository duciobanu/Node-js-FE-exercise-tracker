import express from "express";
import { createUser, getAllUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/api/users", createUser);
router.get("/api/users", getAllUsers);

export default router;