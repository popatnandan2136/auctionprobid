import express from "express";
import {
  sendOtp,
  verifySubmit,
  approveRequest,
} from "../controllers/playerRequest.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify", verifySubmit);
router.put("/:id/approve", auth, authorize("ADMIN"), approveRequest);

export default router;