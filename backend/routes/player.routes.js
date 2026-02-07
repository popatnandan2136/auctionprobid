import express from "express";
import {
  createPlayer,
  getAllPlayers,
  getPlayerById,
  getPlayersByAuction,
  updatePlayer,
  deletePlayer
} from "../controllers/player.controller.js";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";
import upload, { handleUpload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public Routes
router.get("/", getAllPlayers);
router.get("/:id", getPlayerById);
router.get("/auction/:auctionId", getPlayersByAuction);

// Protected Routes
router.post("/", auth, role(["ADMIN", "MASTER_ADMIN"]), handleUpload(upload, "image"), createPlayer);
router.put("/:id", auth, role(["ADMIN", "MASTER_ADMIN"]), handleUpload(upload, "image"), updatePlayer);
router.delete("/:id", auth, role(["ADMIN", "MASTER_ADMIN"]), deletePlayer);

export default router;