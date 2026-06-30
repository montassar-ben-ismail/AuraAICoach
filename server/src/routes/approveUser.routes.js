import express from "express"
import {approveUser} from "../controllers/approveUser.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
const router=express.Router()
router.post("/approveUser",verifyToken,approveUser)
export default router