import mongoose from "mongoose"
const targetSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    dailyCalorie:{
        type:Number,
        required:true
    },
    protCible:{
        type:Number,
        required:true
    },
    fatCible:{
        type:Number,
        required:true
    },
    carbCible:{
        type:Number,
        required:true
    },
    protCalorie:{
        type:Number,
        required:true
    },
    fatCalorie:{
        type:Number,
        required:true
    },
    carbCalorie:{
        type:Number,
        required:true
    }
})
export default mongoose.model("Target",targetSchema)