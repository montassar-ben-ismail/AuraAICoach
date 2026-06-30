import express from "express"
import { adminCreateUser } from "../controllers/adminCreateUser.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router()

// Only admins should use this
router.post("/admin/create-user", verifyToken, adminCreateUser)

export default router
