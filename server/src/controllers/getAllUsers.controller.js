import User from "../models/User.js"
export const getAllUsers=async(req,res)=>{
    try{
        const usersApprover=await User.find({isApproved:true,role:"user"})
        const usersAttente=await User.find({isApproved:false,role:"user"})
        return res.status(200).send({status:"ok",approver:usersApprover,attente:usersAttente})

    }catch{
        return res.status(500).send({status:"not ok",message:"Internal server error"})
    }
}