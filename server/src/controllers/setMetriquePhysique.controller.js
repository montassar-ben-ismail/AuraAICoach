import MetriquePhysique from "../models/MetriquePhysique.js"
import Target from "../models/Target.js"
import { FitnessCalculator } from "../utils/FitnessCalculator.js"

export const setMetriquePhysique = async (req, res) => {
    try {
        const userId = req.user.id
        const sanitizedBody = {
            height: Number(req.body.height) || 170,
            weight: Number(req.body.weight) || 70,
            age: Number(req.body.age) || 25,
            gender: req.body.gender || 'male',
            AF: Number(req.body.AF) || 1.375,
            target: req.body.target || 'stay healthy',
            dob: req.body.dob || new Date('2000-01-01')
        };
        const { height, weight, age, gender, AF, target, dob } = sanitizedBody;

        let userMetrique = await MetriquePhysique.findOne({ userId: userId })
        let userTarget = await Target.findOne({ userId: userId })

        const targets = FitnessCalculator.calculateDailyTargets(sanitizedBody);

        if (!userMetrique) {
            userMetrique = new MetriquePhysique({
                userId: userId,
                height: height,
                weight: weight,
                age: age,
                dob: dob,
                gender: gender,
                AF: AF,
                target: target,
                BMR: targets.BMR
            })
            await userMetrique.save()
        } else {
            userMetrique.height = height || userMetrique.height;
            userMetrique.weight = weight || userMetrique.weight;
            userMetrique.age = age || userMetrique.age;
            userMetrique.dob = dob || userMetrique.dob;
            userMetrique.gender = gender || userMetrique.gender;
            userMetrique.AF = AF || userMetrique.AF;
            userMetrique.target = target || userMetrique.target;
            const updatedTargets = FitnessCalculator.calculateDailyTargets(userMetrique);
            userMetrique.BMR = updatedTargets.BMR;
            await userMetrique.save()
        }

        if (!userTarget) {
            userTarget = new Target({
                userId: userId,
                dailyCalorie: targets.dailyCalorie,
                protCible: targets.protCible,
                fatCible: targets.fatCible,
                carbCible: targets.carbCible,
                protCalorie: targets.protCalorie,
                fatCalorie: targets.fatCalorie,
                carbCalorie: targets.carbCalorie
            })
            await userTarget.save()
        } else {
            const updatedTotal = FitnessCalculator.calculateDailyTargets(userMetrique);
            userTarget.dailyCalorie = updatedTotal.dailyCalorie;
            userTarget.protCible = updatedTotal.protCible;
            userTarget.fatCible = updatedTotal.fatCible;
            userTarget.carbCible = updatedTotal.carbCible;
            userTarget.protCalorie = updatedTotal.protCalorie;
            userTarget.fatCalorie = updatedTotal.fatCalorie;
            userTarget.carbCalorie = updatedTotal.carbCalorie;
            await userTarget.save()
        }

        return res.status(200).send({ status: "ok", message: userMetrique })
    } catch (err) {
        console.error("Set Metrique Error:", err);
        return res.status(400).send({ status: "not ok", message: "Server Error: " + err.message })
    }
}
