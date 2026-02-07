import express from "express";
import {
    addCategory,
    getCategories,
    deleteCategory,
} from "../controllers/category.controller.js";
import auth from "../middleware/auth.middleware.js";
import authorize from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/", auth, authorize("ADMIN"), addCategory);
router.get("/", getCategories);
router.delete("/:id", auth, authorize("ADMIN"), deleteCategory);

export default router;