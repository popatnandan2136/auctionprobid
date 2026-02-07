import express from "express";
import {
    createAuction,
    getAllAuctions,
    getAuctionById,
    updateAuction,
    addSponsor,
    startAuction,
    resumeAuction,
    finishAuction,
    selectCurrentPlayer,
    markPlayerSold,
    markPlayerUnsold,
    removePlayerFromTeam,
    relistPlayer,
    toggleRegistration,
    deleteAuction, // 🔥 Import
} from "../controllers/auction.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";
import { handleUpload, uploadAuction } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public
router.get("/all", getAllAuctions); // Alias for frontend compatibility
router.get("/", getAllAuctions);
router.get("/:id", getAuctionById);

// Protected (Admin only)
router.post("/create", auth, authorize(["MASTER_ADMIN", "ADMIN"]), handleUpload(uploadAuction, "logo"), createAuction); // Alias
router.post("/", auth, authorize(["MASTER_ADMIN", "ADMIN"]), handleUpload(uploadAuction, "logo"), createAuction);

router.put("/:id", auth, authorize("ADMIN"), handleUpload(uploadAuction, "logo"), updateAuction);
router.delete("/:id", auth, authorize("ADMIN"), deleteAuction); // 🔥 New Delete Route
router.post("/:id/sponsor", auth, authorize("ADMIN"), addSponsor);
router.put("/:id/start", auth, authorize("ADMIN"), startAuction);
router.put("/:id/resume", auth, authorize("ADMIN"), resumeAuction);
router.put("/:id/resume", auth, authorize("ADMIN"), resumeAuction);
router.put("/:id/finish", auth, authorize("ADMIN"), finishAuction);
router.put("/:id/toggle-registration", auth, authorize("ADMIN"), toggleRegistration);

// Auction Flow
router.put("/:id/select-player", auth, authorize("ADMIN"), selectCurrentPlayer);
router.put("/player/:playerId/sold", auth, authorize("ADMIN"), markPlayerSold);
router.put("/player/:playerId/unsold", auth, authorize("ADMIN"), markPlayerUnsold);
router.put("/player/:playerId/remove", auth, authorize("ADMIN"), removePlayerFromTeam);
router.put("/player/:playerId/relist", auth, authorize("ADMIN"), relistPlayer);

export default router;