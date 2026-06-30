import express from "express"
import {updatePassWord} from "../controllers/updatePassWord.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
const router=express.Router()
router.post("/updatePassWord",verifyToken,updatePassWord)
export default router