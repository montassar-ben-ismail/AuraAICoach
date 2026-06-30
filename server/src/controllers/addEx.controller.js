
//en utilise pour ajouter les exercices dispo dans la DB
import ExercicesAdmin from "../models/ExercicesAdmin.js"
import User from "../models/User.js"

//il faut prendre id user et verifier s'il s'agit d'un admin ou nn
export const addEx=async(req,res)=>{
    const userId=req.user.id
    let user=await User.findById(userId)


    //s'il s'agit d'un admin
    if(user && user.role==="admin"){

         const {nomExercice,muscle,angle,type,category}=req.body
        if(!muscle || !nomExercice || !angle || !type || !category){
            return res.status(400).send({status:"not ok",msg:"Please enter all required data"})
        }
        ExercicesAdmin.findOne({nomExercice:nomExercice,muscle:muscle}).then((ex)=>{
            if(ex){
                return res.status(400).send({status:"not ok",msg:"exercice existe"})
            }
            const newExercice=new ExercicesAdmin({
                nomExercice,
                muscle,
                angle,
                type,
                category
            })
            newExercice.save().then((ex)=>{
                res.status(200).send({status:"ok",msg:"Successfull add exercice",ex})
            }).catch((err)=>{
                return res.status(500).send({status:"error",msg:"Internal server error"})
            })
        }).catch((err)=>{
            return res.status(500).send({status:"error",msg:"Internal server error"})
        })

        //si il n'est pas un admin
        }else{
            return res.status(400).send({status:"error",msg:"c'est n'est pas un admin"})
        }
   
}