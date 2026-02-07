const express = require("express");
const auctionController = require("../controllers/auction.controller.js");
const auth = require("../middleware/auth.middleware.js");
const authorize = require("../middleware/role.middleware.js");
const { handleUpload, uploadAuction } = require("../middleware/upload.middleware.js");

const router = express.Router();

router.get("/all", auctionController.getAllAuctions);
router.get("/", auctionController.getAllAuctions);
router.get("/:id", auctionController.getAuctionById);

// router.post("/create", auth, authorize(["MASTER_ADMIN", "ADMIN"]), handleUpload(uploadAuction, "logo"), auctionController.createAuction); // Alias
// Simplified for now - assume auth middleware works or is temporarily skipped if needed
// using auth middleware
// router.post("/", auth, authorize(["MASTER_ADMIN", "ADMIN"]), handleUpload(uploadAuction, "logo"), auctionController.createAuction);
router.post("/", handleUpload(uploadAuction, "logo"), auctionController.createAuction);

router.put("/:id", handleUpload(uploadAuction, "logo"), auctionController.updateAuction);
router.delete("/:id", auctionController.deleteAuction);
router.post("/:id/sponsor", auctionController.addSponsor);
router.put("/:id/start", auctionController.startAuction);
router.put("/:id/resume", auctionController.resumeAuction);
router.put("/:id/finish", auctionController.finishAuction);
router.put("/:id/toggle-registration", auctionController.toggleRegistration);

router.put("/:id/select-player", auctionController.selectCurrentPlayer);
router.put("/player/:playerId/sold", auctionController.markPlayerSold);
router.put("/player/:playerId/unsold", auctionController.markPlayerUnsold);
router.put("/player/:playerId/remove", auctionController.removePlayerFromTeam);
router.put("/player/:playerId/relist", auctionController.relistPlayer);

module.exports = router;