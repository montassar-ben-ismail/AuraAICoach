import User from "../models/User.js";
import bcrypt from "bcryptjs";

export const adminCreateUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send({ status: "not ok", message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            isApproved: true // Admin created users are approved by default
        });

        await newUser.save();

        return res.status(201).send({
            status: "ok",
            message: "User created successfully",
            user: { name, email, role: newUser.role }
        });
    } catch (error) {
        console.error("Admin Create User Error:", error);
        return res.status(500).send({ status: "not ok", message: "Internal server error" });
    }
};
