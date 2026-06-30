import mongoose from "mongoose"
const packSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    dateDebut:{
        type:Date,
        required:true
    },
    dateFin:{
        type:Date,
        required:true
    },
    packNo:{
        type:Number,
        required:true
    }
},{timestamps:true})
export default mongoose.model("Pack",packSchema)