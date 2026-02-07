import express from "express";
import { addSponsor, removeSponsor, getSponsors, updateSponsor } from "../controllers/sponsor.controller.js";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

import { uploadSponsor, handleUpload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/:auctionId", getSponsors);
router.post("/:auctionId/add", auth, role(["ADMIN", "MASTER_ADMIN"]), handleUpload(uploadSponsor, "logo"), addSponsor);
router.put("/:auctionId/:sponsorId", auth, role(["ADMIN", "MASTER_ADMIN"]), handleUpload(uploadSponsor, "logo"), updateSponsor);
router.delete("/:auctionId/:sponsorId", auth, role(["ADMIN", "MASTER_ADMIN"]), removeSponsor);

export default router;