import express from "express";
import { placeBid, getAuctionState } from "../controllers/bid.controller.js";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

const router = express.Router();

// Public/Auth - Get State (Polling)
router.get("/:auctionId/state", getAuctionState);

// Team - Place Bid
router.post("/place", auth, role(["TEAM", "ADMIN", "MASTER_ADMIN"]), placeBid);

export default router;
