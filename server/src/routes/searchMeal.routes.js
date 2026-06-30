import express from "express"
import {searchMeal} from "../controllers/searchMeal.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
const router=express.Router()
router.get("/searchMeal",verifyToken,searchMeal)
export default router