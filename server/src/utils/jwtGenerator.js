export const initializeJWTSecret = () => {
  if (process.env.JWT_SECRET) {
    console.log("✓ JWT_SECRET configured");
    return;
  }

  throw new Error("JWT_SECRET is missing. Define it in the environment before starting the server.");
};
