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

router.post("/", auth, authorize(["ADMIN", "MASTER_ADMIN"]), handleUpload(uploadTeam, "logo"), createTeam);
router.post("/bonus", auth, authorize(["ADMIN", "MASTER_ADMIN"]), addBonus); // 🔥 New Bonus Route
router.get("/auction/:auctionId", getTeamsByAuction);
router.get("/:teamId", getTeamById);
router.put("/:teamId", auth, authorize(["ADMIN", "MASTER_ADMIN", "TEAM"]), handleUpload(uploadTeam, "logo"), updateTeam); // Owners might update their own team info
router.delete("/:teamId", auth, authorize(["ADMIN", "MASTER_ADMIN"]), deleteTeam);

export default router;
