import User from "../models/User.js"

export const ignoreUser=async(req,res)=>{
    try{ 
        const {email}=req.body
        if(!email){
            return res.status(400).send({status:"not ok",message:"there is no email of user to ignored in the request"})
        }
        const userIgnored=await User.findOneAndDelete({email:email})
        return res.status(200).send({status:"ok",message:"user ignored successfuly"})
    }catch{
        return res.status(500).send({status:"not ok",message:"Internal server error"})
    }
}
   