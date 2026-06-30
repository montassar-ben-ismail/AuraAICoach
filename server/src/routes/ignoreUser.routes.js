import express from "express"
import {ignoreUser} from "../controllers/ignoreUser.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"
const router=express.Router()
router.post("/ignoreUser",verifyToken,ignoreUser)
export default router