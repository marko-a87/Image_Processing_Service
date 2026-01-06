import express from "express";

import { getUsersController, deleteUserController, getUserController } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/users", getUsersController);
router.get("/users/:id", getUserController);
router.delete("/users/:id", deleteUserController);

export default router;
