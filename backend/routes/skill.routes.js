import express from "express";
import auth from "../middleware/auth.middleware.js";
import role from "../middleware/role.middleware.js";

import { createSkill, getSkills } from "../controllers/skill.controller.js";

const router = express.Router();

router.post("/", auth, role(["ADMIN"]), createSkill);
router.get("/", getSkills);

export default router;