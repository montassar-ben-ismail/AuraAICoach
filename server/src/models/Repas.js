import mongoose from "mongoose"
const repasSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    textBrut:{
        type:String,
        required:true
    },
    calories:{
        type:Number,
        required:true
    },
    protein:{
        type:Number,
        required:true
    },
    carb:{
        type:Number,
        required:true
    },
    fat:{
        type:Number,
        required:true
    }}
    ,{timestamps:true})
export default mongoose.model("Repas",repasSchema)