import './config/env.js'
import { connectDb } from "./db/connectDb.js";
import { app } from "./app.js";

// // Load .env from Backend/.env
// dotenv.config({
//   path: path.resolve("./.env"),
// });

// ✅ Verify required environment variables
const requiredEnv = ["PORT", "GEMINI_API_KEY"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error(`❌ Missing environment variables: ${missingEnv.join(", ")}`);
  process.exit(1); // Stop the app immediately
}

console.log("✅ Environment variables loaded successfully.");

// Start server after DB connects
connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8090, () => {
      console.log(`🚀 Server is running on PORT ${process.env.PORT || 8090}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error occurred while connecting to DB:", err);
    process.exit(1);
  });
