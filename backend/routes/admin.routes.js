import express from "express";
import { registerAdmin, getAdmins, deleteAdmin, toggleAdminStatus } from "../controllers/auth.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

// Protected Routes (MASTER_ADMIN only)
router.post("/add", auth, authorize("MASTER_ADMIN"), registerAdmin);
router.get("/", auth, authorize("MASTER_ADMIN"), getAdmins);
router.delete("/:id", auth, authorize("MASTER_ADMIN"), deleteAdmin);
router.put("/:id/status", auth, authorize("MASTER_ADMIN"), toggleAdminStatus);

export default router;
