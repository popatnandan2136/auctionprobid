import express from "express";
import {
  addPlayer,
  updatePlayer,
  deletePlayer,
  getPlayersByAuction,
  getPlayerById,
  searchPlayers,
  addPlayerToAuction,
  sellPlayer,
  markUnsold,
  removePlayerFromTeam,
  relistPlayer
} from "../controllers/player.controller.js";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

import upload, { handleUpload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/auction/:auctionId", getPlayersByAuction);
router.get("/search", searchPlayers);
router.get("/:playerId", getPlayerById);

router.post("/add", auth, role(["ADMIN", "MASTER_ADMIN"]), handleUpload(upload, "image"), addPlayer);
router.post("/add-to-auction", auth, role(["ADMIN", "MASTER_ADMIN"]), addPlayerToAuction);
router.put("/:playerId", auth, role(["ADMIN", "MASTER_ADMIN"]), handleUpload(upload, "image"), updatePlayer);
router.delete("/:playerId", auth, role(["ADMIN", "MASTER_ADMIN"]), deletePlayer);

router.post("/:playerId/sell", auth, role(["ADMIN", "MASTER_ADMIN"]), sellPlayer);
router.post("/:playerId/unsold", auth, role(["ADMIN", "MASTER_ADMIN"]), markUnsold);
router.post("/:playerId/relist", auth, role(["ADMIN", "MASTER_ADMIN"]), relistPlayer);
router.post("/:playerId/remove-team", auth, role(["ADMIN", "MASTER_ADMIN"]), removePlayerFromTeam);

export default router;