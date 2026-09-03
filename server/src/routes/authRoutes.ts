import { Router } from "express";
import { register, login, updatePassword } from "../controllers/authController";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.put("/password", authenticate, updatePassword);

export default router;