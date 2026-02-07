import express from "express";
import multer from "multer";
import path from "path";
import { getPartners, createPartner, deletePartner } from "../controllers/partner.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

// Image Upload Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// Routes
router.get("/", getPartners); // Public
router.post("/", auth, authorize("MASTER_ADMIN"), upload.single("image"), createPartner); // Create (Master only)
router.delete("/:id", auth, authorize("MASTER_ADMIN"), deletePartner); // Delete (Master only)

export default router;
