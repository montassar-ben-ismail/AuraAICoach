import express from "express";
import {setTrainningPlan} from "../controllers/setTrainningPlan.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";
const router=express.Router();
router.post("/setTrainningPlan", verifyToken, setTrainningPlan);
export default router