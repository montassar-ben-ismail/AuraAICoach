import User from "../models/User.js"

export const approveUser=async(req,res)=>{
    try{
        //l'identifiant unique de user que l'admin doit approuver
        const {email}=req.body
        if(!email){
            return res.status(400).send({status:"not ok",message:"there is no email in the request for user to approved"})
        }
        const userApproved=await User.findOne({email:email})
        userApproved.isApproved=true
        await userApproved.save()
        return res.status(200).send({status:"ok",message:"user is approved successfully"})
    }catch{
        return res.status(500).send({status:"not ok",message:"Internal server error"})
    }
    

}