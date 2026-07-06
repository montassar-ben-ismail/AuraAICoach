import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


export const signup=async(req,res)=>{
    const {name,email,password,role}=req.body
    const isApproved=false
    if(!name || !password || !email || !role){
        return res.status(400).send({status:"not ok",msg:"Please enter all required data"})
    }
    //check if email already exists
    User.findOne({email:email}).then((user)=>{
        if (user){
            return res.status(400).send({status:"not ok",msg:"email already exists"});
        }
        //create a new user instance
        const newUser=new User({
            name,
            email,
            password,
            role,
            isApproved
        });
        //generate salt and hash password
        bcrypt.genSalt(10,(err,salt)=>{
            if(err){
                return res.status(500).send({status:"error",msg:"Internal server error"});
            }
            bcrypt.hash(newUser.password,salt,(err,hash)=>{
                if(err){
                    return res.status(500).send({status:"error",msg:"Internal server error"})
                }
                //replace plain password with hashed password
                newUser.password=hash;
                //save the user to the database
                newUser.save().then((user)=>{
                    //generate JWT token
                    jwt.sign(
                        {id:user.id},
                        process.env.JWT_SECRET,
                        {expiresIn:"7d"},
                        (err,token)=>{
                            if(err){
                                return res.status(500).send({status:"error",msg:"Internal server error"})
                            }
                            res.status(200).send({
                                status:"ok",
                                msg:"Successfull registered",
                                token,
                                user: {
                                    id: user._id,
                                    name: user.name,
                                    email: user.email,
                                    role: user.role,
                                    isPro: user.estPro || false,
                                    isApproved:user.isApproved
                                }
                            })
                        }
                    )
                }).catch((err)=>{
                    return res.status(500).send({status:"error",msg:"Internal server error"})
                })
            })
        })
    
    }).catch((err)=>{
        return res.status(500).send({status:"error",msg:"Internal server error"})
    })

}