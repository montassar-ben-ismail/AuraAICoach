import express from "express";
import {getMacro} from "../controllers/getMacro.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
const router=express.Router();
router.post("/getMacro", verifyToken, getMacro);
export default router