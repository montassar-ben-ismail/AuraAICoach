import Plan from "../models/Plan.js"
import ExercicesAdmin from "../models/ExercicesAdmin.js"
import MetriquePhysique from "../models/MetriquePhysique.js"
import { FitnessCalculator } from "../utils/FitnessCalculator.js"

export const setTrainningPlan=async(req,res)=>{
    try{ 
    const userId=req.user.id
    const {nbJourDispo,nomDeSalle}=req.body
    
    console.log(`Starting intelligent plan generation for user ${userId}, days: ${nbJourDispo}`);
    
    const userMetrics = await MetriquePhysique.findOne({ userId });
    if (!userMetrics) {
        return res.status(400).send({ status: "not ok", msg: "Please complete your physical metrics first" });
    }

    const exercicesDB = await ExercicesAdmin.find({});
    const { plan, type } = await FitnessCalculator.cherryPickWorkout(exercicesDB, Number(nbJourDispo), userMetrics.target);
    
    if(!plan){
        return res.status(400).send({status:"not ok",msg:"Generation logic error or unsupported days"})
    }

    let planUser=await Plan.findOne({userId:userId})
    if(planUser){
        planUser.exercices=plan
        planUser.typeSplit=type
        planUser.markModified('exercices'); 
        await planUser.save()
        return res.status(200).send({status:"ok",msg:"Intelligent plan updated successfully"})
    }
    
    const newPlan=new Plan({
        userId,
        typeSplit:type,
        exercices:plan
    })
    await newPlan.save()
    return res.status(200).send({status:"ok",msg:"Intelligent plan created successfully"})

}catch(err){
    console.error("FATAL ERROR in setTrainningPlan:", err);
    return res.status(400).send({status:"not ok",msg:"Internal server error",error:err.message})
}
}