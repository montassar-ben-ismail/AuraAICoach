import express from "express"
import { getStats } from "../controllers/getStats.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/getStats", verifyToken, getStats)

export default router
