import express from "express";
import {getMetriquePhysique} from "../controllers/getMetriquePhysique.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";
const router=express.Router();
router.get("/getMetriquePhysique", verifyToken, getMetriquePhysique);
export default router