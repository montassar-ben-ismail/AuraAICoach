import express from "express"
import {historique} from "../controllers/getHistorique.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
const router=express.Router()
router.get("/historique",verifyToken,historique)
export default router

