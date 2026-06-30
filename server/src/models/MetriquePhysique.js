import mongoose from "mongoose"
const metriquePhysiqueschema=new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // relation avec User
        required:true,
        unique:true
    },
    height:{
        type:Number,
        required:true,
    },
    weight:{
        type:Number,
        required:true,
    },
    age:{
        type:Number,
        required:true,
    },
    dob:{
        type:Date,
        required:false
    },
    gender:{
        type:String,
        required:true,
    },
    AF:{
        type:Number,
        required:true,
    },
    target:{
        type:String,
        required:true,
    },
    BMR:{
        type:Number,
        required:true
    }},
{ timestamps: true }
)
export default mongoose.model("MetriquePhysique",metriquePhysiqueschema)
