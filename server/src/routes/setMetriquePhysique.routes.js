import express from "express";
import {setMetriquePhysique} from "../controllers/setMetriquePhysique.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js";
const router=express.Router();
router.post("/setMetriquePhysique", verifyToken, setMetriquePhysique);
export default router