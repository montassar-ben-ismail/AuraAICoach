import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    // On utilise exactement le modèle que ton curl a listé comme disponible
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const food="2 eggs with bread and cheese";
    const prompt = `You are a nutrition expert.
Analyze this meal: ${food}
Return juste:
- calories
- protein
- carbs
- fat
in JSON format`
;

    console.log("Appel à l'API en cours avec Gemini 2.5 Flash...");
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("--- RÉUSSITE ---");
    console.log(text);
  } catch (error) {
    console.error("ERREUR :");
    console.error(error.message);
  }
}

run();