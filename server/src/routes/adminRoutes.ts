import { Router } from "express";
import {
  getDashboardStats,
  addUser,
  addStore,
  getUsers,
  getStores,
  getUserDetails,
  updateStoreRating,
  deleteStore,
} from "../controllers/adminController";
import { authenticate } from "../middleware/auth";
import { authorize } from "../middleware/roleAuth";
import { UserRole } from "../types";

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.ADMIN));

router.get("/dashboard", getDashboardStats);
router.post("/users", addUser);
router.post("/stores", addStore);
router.get("/users", getUsers);
router.get("/stores", getStores);
router.get("/users/:id", getUserDetails);
router.put("/stores/:id/rating", updateStoreRating);
router.delete("/stores/:id", deleteStore);

export default router;