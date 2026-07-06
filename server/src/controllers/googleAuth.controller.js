import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
    try {
        const { credential } = req.body;

        // 1. Verify Google Token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const { sub: googleId, email, name, picture } = ticket.getPayload();

        // 2. Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            // Update googleId if it wasn't there before
            if (!user.googleId) {
                user.googleId = googleId;
                await user.save();
            }
        } else {
            // 3. Create new user if not found (Signup)
            user = new User({
                name,
                email,
                googleId,
                role: 'user', // Default role
                estPro: false,
                isApproved: false
            });
            await user.save();
        }

        // 4. Generate AuraCoach JWT
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        // 5. Response
        res.status(200).json({
            status: "ok",
            message: "Google Auth successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isPro: user.estPro || false,
                isApproved: user.isApproved
            },
            isNewUser: !user.googleId || user.isNew // Hint for frontend to redirect to onboarding
        });

    } catch (err) {
        console.error("Google Auth Error:", err);
        res.status(500).json({ status: "error", message: "Google authentication failed" });
    }
};
