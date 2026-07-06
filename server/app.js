import express from "express";
import cors from "cors";
import authRoutes from "./src/routes/auth.routes.js";
import signupRoutes from "./src/routes/signUp.routes.js";
import addExRoutes from "./src/routes/addEx.routes.js";
import setTrainningPlanRoutes from "./src/routes/setTrainningPlan.routes.js"
import getTrainningPlanRoutes from "./src/routes/getTrainningPlan.routes.js"
import setMetriquePhysique from "./src/routes/setMetriquePhysique.routes.js"
import getMetriquePhysique from "./src/routes/getMetriquePhysique.routes.js"
import googleAuthRoutes from "./src/routes/googleAuth.routes.js"
import getMacro from "./src/routes/getMacro.routes.js"
import setPassWordRoutes from "./src/routes/updatePassWord.routes.js"
import historique from "./src/routes/getHistorique.routes.js"
import approveUser from "./src/routes/approveUser.routes.js"
import ignoreUser from "./src/routes/ignoreUser.routes.js"
import getAllUsers from "./src/routes/getAllUsers.routes.js"
import serachMeal from "./src/routes/searchMeal.routes.js"
import getStats from "./src/routes/getStats.routes.js"
import adminCreateUser from "./src/routes/adminCreateUser.routes.js"
import payment from "./src/routes/create-payment-intent.routes.js"

const app = express();

//CORS pour le client local
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());
app.use(("/", authRoutes));
app.use(("/", signupRoutes));
app.use(("/", addExRoutes))
app.use(("/", setTrainningPlanRoutes))
app.use(("/", getTrainningPlanRoutes))
app.use(("/", setMetriquePhysique))
app.use(("/", getMetriquePhysique))
app.use(("/", googleAuthRoutes))
app.use(("/", getMacro))
app.use(("/", setPassWordRoutes))
app.use(("/", historique))
app.use("/", approveUser)
app.use("/", ignoreUser)
app.use("/", getAllUsers)
app.use("/", serachMeal)
app.use("/", getStats)
app.use("/", adminCreateUser)
app.use("/",payment)
export default app;