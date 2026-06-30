import express from "express";
import {getTrainningPlan} from "../controllers/getTrainningPlan.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";
const router=express.Router();
router.get("/getTrainningPlan", verifyToken, getTrainningPlan);
export default router