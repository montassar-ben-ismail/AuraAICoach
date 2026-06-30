import express from "express"
import {getAllUsers} from "../controllers/getAllUsers.controller.js"
import {verifyToken } from "../middleware/auth.middleware.js"
const router=express.Router()
router.get("/getAllUsers",verifyToken,getAllUsers)
export default router