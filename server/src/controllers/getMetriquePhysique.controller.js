
import Metrique from "../models/MetriquePhysique.js"
import Target from "../models/Target.js"
export const getMetriquePhysique=async(req,res)=>{
    try{
        const userId=req.user.id
        let userMetrique=await Metrique.findOne({userId:userId})
        let userTarget=await Target.findOne({userId:userId})
        if(userMetrique && userTarget){
            return res.status(200).send({
                status:"ok",
                message:"importation des donnée avec succée",
                height: userMetrique.height,
                weight: userMetrique.weight,
                age: userMetrique.age,
                dob: userMetrique.dob,
                gender: userMetrique.gender,
                AF: userMetrique.AF,
                target:userMetrique.target,
                BMR:userMetrique.BMR,
                dailyCalorie:userTarget.dailyCalorie,
                proteineCible:userTarget.protCible,
                fatCible:userTarget.fatCible,
                carbohydrateCible:userTarget.carbCible,
                proteineCalorie:userTarget.protCalorie,
                fatCalorie:userTarget.fatCalorie,
                carbohydrateCalorie:userTarget.carbCalorie
            })
        }else{
            return res.status(400).send({status:"not ok",message:"ce utilisateur n'as pas des metrique et target dans notre DB"})
        }
    }catch{
        return res.status(400).send({status:"not ok",message:"Internal server error"})
    }
}