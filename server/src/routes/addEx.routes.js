import express from "express";
import {addEx} from "../controllers/addEx.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
const router=express.Router();
router.post("/addEx", verifyToken,addEx);
export default router