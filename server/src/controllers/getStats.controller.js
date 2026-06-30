import Repas from "../models/Repas.js";
import mongoose from "mongoose";

export const getStats = async (req, res) => {
    try {
        const userIdRaw = req.user.id;
        const userIdObj = new mongoose.Types.ObjectId(userIdRaw);

        // Ensure we cover enough history even if timezones are shifted
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 10);
        startDate.setHours(0, 0, 0, 0);

        const statsArray = await Repas.aggregate([
            {
                $match: {
                    $or: [
                        { userId: userIdObj },
                        { userId: userIdRaw }
                    ],
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalCalories: { $sum: "$calories" }
                }
            }
        ]);

        const statsMap = new Map();
        statsArray.forEach(s => statsMap.set(s._id, s.totalCalories));

        const result = [];
        // Generate current 7-day view ending with TODAY
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];

            result.push({
                date: dateStr,
                calories: statsMap.get(dateStr) || 0
            });
        }

        return res.status(200).send({ status: "ok", message: result });
    } catch (error) {
        console.error("Stats Error:", error);
        return res.status(400).send({ status: "not ok", message: "Failed to generate analytics" });
    }
};
