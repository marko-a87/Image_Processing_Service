import express from "express";
import {
  signupController,
  loginController,
  logoutController,
  refreshTokenController,
} from "../controllers/auth.controller.js";
import {
  validateLoginInput,
  validateSignupInput,
} from "../middleware/validateSchema.middleware.js";

const router = express.Router();

router.post("/signup", validateSignupInput, signupController);
router.post("/login", validateLoginInput, loginController);
router.post("/logout", logoutController);
router.post("/refresh", refreshTokenController);

export default router;
