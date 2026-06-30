import User from "../models/User.js"
import bcrypt from "bcryptjs"

export const updatePassWord = async (req, res) => {
    try {
        const userId = req.user.id
        const { currentPassWord, newPassWord, confirmNewPassWord } = req.body
        const user = await User.findOne({ _id: userId })
        const isMatch = await bcrypt.compare(currentPassWord, user.password)
        if (!currentPassWord || !newPassWord || !confirmNewPassWord) {
            return res.status(400).send({ status: "not ok", message: "All fields are required" })
        }
        if (!isMatch) {
            return res.status(400).send({ status: "not ok", message: "current password is incorrect" })
        }
        if (newPassWord !== confirmNewPassWord) {
            return res.status(400).send({ status: "not ok", message: "new passwords do not match" })
        }
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(newPassWord, salt)
        user.password = hash
        await user.save()
        return res.status(200).send({ status: "ok", message: "password updated succesfully" })

    } catch {
        return res.status(500).send({ status: " not ok ok ok", message: "Internal server error" })
    }
}