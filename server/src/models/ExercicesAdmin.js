import mongoose from "mongoose"
const exercicesSchema=new mongoose.Schema({
    nomExercice:{
        type:String,
        required:true,
        unique:true
    },
    muscle:{
        type:String,
        required:true
    },
    angle:{
        type:String,
        required:false
    },
    type:{
        type:String,
        enum:['Compound', 'Isolation'],
        required:true,
        default: 'Compound'
    },
    category:{
        type:String,
        enum:['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core', 'Traps'],
        required:true
    }
})
export default mongoose.model("ExercicesAdmin",exercicesSchema)
