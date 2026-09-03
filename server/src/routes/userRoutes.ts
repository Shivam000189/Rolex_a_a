import { Router } from "express";
import {
  getAllUsers,
  getAllStores,
  submitRating,
  modifyRating,
} from "../controllers/userController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleAuth";
import { UserRole } from "../types";

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.USER));

router.get("/users", getAllUsers);
router.get("/stores", getAllStores);
router.post("/ratings", submitRating);
router.put("/ratings", modifyRating);

export default router;