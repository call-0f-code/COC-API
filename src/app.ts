import express from "express";
import cors from "cors";
import multer from "multer";
import { json, urlencoded } from "body-parser";
import routes from "./routes";
import { errorHandler } from "./utils/apiError";
import { createClient } from "@supabase/supabase-js";
import config from "./config";
import path from "path";

// Initialize Supabase client for storage operations
export const supabase = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_SERVICE_ROLE_KEY,
);

const app = express();


app.use(
  cors({
    origin: config.ALLOWED_ORIGINS || "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);


app.use(json());
app.use(urlencoded({ extended: true }));


const upload = multer({ storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 }
});


app.use("/health",(req,res)=>{
  res.status(200).json({ message: "OK" });
})

app.use("/api/v1", routes(upload, supabase));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Not Found" });
});


// Global error handler
app.use(errorHandler);

// Serve API documentation
app.use("/docs", express.static(path.join(__dirname, "..", "docs/apidoc")));
export default app;
