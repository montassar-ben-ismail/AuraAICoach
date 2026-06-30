import crypto from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const initializeJWTSecret = () => {
  const envPath = path.join(__dirname, "../../.env");
  
  // Check if JWT_SECRET already exists in environment
  if (process.env.JWT_SECRET) {
    console.log("✓ JWT_SECRET already configured");
    return;
  }

  // Generate a secure random secret (256 bits / 32 bytes)
  const jwtSecret = crypto.randomBytes(32).toString("hex");
  
  // Add to .env file
  try {
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, "utf-8");
      
      // Check if JWT_SECRET already exists in file
      if (envContent.includes("JWT_SECRET=")) {
        // Replace existing JWT_SECRET
        envContent = envContent.replace(
          /JWT_SECRET=.*/,
          `JWT_SECRET=${jwtSecret}`
        );
      } else {
        // Append JWT_SECRET
        envContent += `\nJWT_SECRET=${jwtSecret}`;
      }
      
      fs.writeFileSync(envPath, envContent);
    } else {
      // Create .env with JWT_SECRET
      fs.writeFileSync(envPath, `JWT_SECRET=${jwtSecret}\n`);
    }
    
    // Set it in current process
    process.env.JWT_SECRET = jwtSecret;
    console.log("✓ JWT_SECRET auto-generated and saved to .env");
  } catch (error) {
    console.error("Error initializing JWT secret:", error.message);
    // Fallback: use generated secret in memory only
    process.env.JWT_SECRET = jwtSecret;
    console.log("⚠ JWT_SECRET generated in memory (could not write to .env)");
  }
};
