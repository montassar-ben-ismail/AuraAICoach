import Pack from "../models/Pack.js";

export const getPack = async (req, res) => {
    try {
        const userId = req.user.id;
        const pack = await Pack.findOne({ userId: userId });

        if (!pack) {
            return res.status(200).send({ status: "ok", message: null });
        }

        res.status(200).send({ status: "ok", message: pack });
    } catch (err) {
        res.status(500).send({ status: "not ok", error: err.message });
    }
}
