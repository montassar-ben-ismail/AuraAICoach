import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
export const login=async(req,res)=>{
    try{
        const {email,password,role}=req.body;
        //chercher l'utilisateur
        const user=await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Email incorrect"});
        }
        //comparer le mot de passe 
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            return res.status(400).json({message:"Mot de passe incorrect"});
        }
        //utilisateur exite et le mot de passe correct
        const token=jwt.sign(
            {id:user._id, role:user.role},process.env.JWT_SECRET,{expiresIn:"7d"});
        //reponse
        res.status(200).json({
            status: "ok",
            message:"Connexion réussie",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isPro: user.estPro || false,
                isApproved:user.isApproved
            }
            });
    }catch(err){
        res.status(500).json({message:err.message});
    }
}

