import express from "express";
import {
    createTeam,
    getTeamsByAuction,
    getTeamById,
    updateTeam,
    deleteTeam,
    addBonus
} from "../controllers/team.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { uploadTeam, handleUpload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public Routes
router.get("/auction/:auctionId", getTeamsByAuction);
router.get("/:teamId", getTeamById);

// Protected Routes
router.post("/", auth, authorize(["ADMIN", "MASTER_ADMIN"]), handleUpload(uploadTeam, "logo"), createTeam);
router.put("/:teamId", auth, authorize(["ADMIN", "MASTER_ADMIN", "TEAM"]), handleUpload(uploadTeam, "logo"), updateTeam);
router.delete("/:teamId", auth, authorize(["ADMIN", "MASTER_ADMIN"]), deleteTeam);
router.post("/bonus", auth, authorize(["ADMIN", "MASTER_ADMIN"]), addBonus);

export default router;
