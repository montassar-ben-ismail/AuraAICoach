import dotenv from "dotenv"
import Stripe from "stripe"
import User from "../models/User.js"
import Pack from "../models/Pack.js"

dotenv.config()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PLAN_DURATIONS = {
    'weekly': 7,
    'monthly': 30,
    'quarterly': 90
};

/**
 * Creates a Stripe Payment Intent.
 * Stores planId and duration in metadata.
 */
export const createPaymentIntent = async (req, res) => {
    try {
        const { amount, planId } = req.body
        const durationDays = PLAN_DURATIONS[planId] || 30;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: "usd",
            automatic_payment_methods: { enabled: true },
            metadata: {
                userId: req.user.id,
                planId: planId,
                durationDays: durationDays
            }
        })

        res.status(200).send({
            status: "ok",
            clientSecret: paymentIntent.client_secret
        })
    } catch (err) {
        console.error("Stripe Intent Error:", err)
        res.status(500).send({ status: "not ok", error: err.message })
    }
}

/**
 * Verifies the payment intent status and upgrades the user.
 * Stackable renewal logic implemented.
 */
export const confirmPayment = async (req, res) => {
    try {
        const userId = req.user.id
        const { paymentIntentId } = req.body

        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).send({
                status: "not ok",
                message: "Payment verification failed."
            })
        }

        if (paymentIntent.metadata.userId !== userId) {
            return res.status(403).send({
                status: "not ok",
                message: "Security violation: metadata mismatch."
            })
        }

        const durationDays = parseInt(paymentIntent.metadata.durationDays) || 30;

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).send({ status: "not ok", message: "User not found" })
        }

        user.estPro = true
        await user.save()

        const now = new Date()
        let existingPack = await Pack.findOne({ userId: userId })

        if (!existingPack) {
            const dateFin = new Date(now)
            dateFin.setDate(dateFin.getDate() + durationDays)
            const newPack = new Pack({
                userId: userId,
                dateDebut: now,
                dateFin: dateFin,
                packNo: 1
            })
            await newPack.save()
        } else {
            // Stack the new duration onto the existing end date, or start from today if expired
            const baseDate = existingPack.dateFin > now ? existingPack.dateFin : now
            const newDateFin = new Date(baseDate)
            newDateFin.setDate(newDateFin.getDate() + durationDays)

            existingPack.dateDebut = now // Transaction date
            existingPack.dateFin = newDateFin
            existingPack.packNo += 1
            await existingPack.save()
        }

        res.status(200).send({ status: "ok", message: "Access granted" })
    } catch (err) {
        console.error("Payment Confirmation Error:", err)
        res.status(500).send({ status: "not ok", error: err.message })
    }
}