import Repas from "../models/Repas.js"

export const searchMeal=async(req,res)=>{
    try{
        const {searchText}=req.body
        const repasChercher=await Repas.findOne({textBrut:searchText})
        if(!repasChercher){
            return res.status(400).send({status:"not ok",message:"there is no meal with this name"})
        }
        return res.status(200).send({status:"ok",message:repasChercher})
    }catch{
        return res.status(500).send({status:"not ok",message:"Internal server error"})
    } 
}