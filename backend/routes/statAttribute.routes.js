import express from "express";
import {
    createStatAttribute,
    getAllStatAttributes,
    updateStatAttribute,
    deleteStatAttribute
} from "../controllers/statAttribute.controller.js";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

const router = express.Router();

// Public (or maybe authenticated? usually admin needs this, but fetching might be public for auction display)
router.get("/", getAllStatAttributes);

// Admin Only
router.post("/", auth, role(["ADMIN", "MASTER_ADMIN"]), createStatAttribute);
router.put("/:id", auth, role(["ADMIN", "MASTER_ADMIN"]), updateStatAttribute);
router.delete("/:id", auth, role(["ADMIN", "MASTER_ADMIN"]), deleteStatAttribute);

export default router;
