import mongoose from "mongoose";
import "./src/config/env.js";
import app from "./app.js";
import { initializeJWTSecret } from "./src/utils/jwtGenerator.js";

initializeJWTSecret();

const port=process.env.PORT;
mongoose.connect(process.env.MONGO_URL).then(()=>{
    console.log("MongoDB connected");
    app.listen(port,()=>{
        console.log(`Server runnig in port ${port}`);
    });
}).catch((err)=>console.log(err));
