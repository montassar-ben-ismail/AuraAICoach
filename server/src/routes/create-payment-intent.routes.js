import express from "express";
import { createPaymentIntent, confirmPayment } from "../controllers/create-payment-intent.controller.js"
import { getPack } from "../controllers/getPack.controller.js"
import { verifyToken } from "../middleware/auth.middleware.js"

const router = express.Router();

router.post("/create-payment-intent", verifyToken, createPaymentIntent);
router.post("/confirm-payment", verifyToken, confirmPayment);
router.get("/get-pack", verifyToken, getPack);

export default router;