import { Router } from "express";
import {
  getDashboard,
  getAverageRating,
} from "../controllers/storeOwnerController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleAuth";
import { UserRole } from "../types";

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.STORE_OWNER));

router.get("/dashboard", getDashboard);
router.get("/average-rating", getAverageRating);

export default router;