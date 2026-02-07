import express from "express";
import {
    registerAdmin,
    login,
    forgotPassword,
    resetPassword,
    resetUserPassword,
} from "../controllers/auth.controller.js";

import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/register-admin", auth, role("MASTER_ADMIN"), registerAdmin);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/reset-user-password", auth, role("MASTER_ADMIN"), resetUserPassword);

export default router;
