import Plan from "../models/Plan.js"
export const getTrainningPlan=async(req,res)=>{
    try{ 
   
    const userId=req.user.id
    let planUser=await Plan.findOne({userId:userId})
    if(!planUser){
     
     //si l'utilisateur na pas un plan d'entrenement
     return res.status(400).send({status:"not ok",msg:"ce utilisateur n'as pas un plan d'entrenemment"})
    }
    //si l'utilisateur déja a un plan
    return res.status(200).send({status:"ok",msg:"plan entrenemment trouver",typeSplit:planUser.typeSplit,planWeek:planUser.exercices})

    

}catch(err){
    return res.status(400).send({status:"not ok",msg:"Internal server error",error:err.message})
}
}