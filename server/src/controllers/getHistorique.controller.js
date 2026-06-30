import Repas from "../models/Repas.js"

export const historique=async(req,res)=>{
    const userId=req.user.id

    //pour recuperer les repas de date actuelle seulement
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const nextDay = new Date(startOfDay);
    nextDay.setDate(nextDay.getDate() + 1);

    const userRepas = await Repas.find({
      userId,
      createdAt: { $gte: startOfDay, $lt: nextDay }
    }).sort({ createdAt: -1 });
    if(!userRepas){
        return res.status(400).send({status:"not ok",message:"no repas for today"})
    }
    return res.status(200).send({status:"ok",message:userRepas})
}