// Backend/app.js

import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnection } from "./database/dbConnection.js";
import fileUpload from "express-fileupload";
import messageRouter from "./router/messageRouter.js"; 
import { errorMiddleware } from "./middlewares/errorMiddleware.js";
// import { userRouter } from "./router/userRouter.js";
import { appointmentRouter } from "./router/appointmentRouter.js";
import userRouter from "./router/userRouter.js"; 

// Load environment variables
config({ path: "./config/config.env" });

const app = express();

// Database Connection
dbConnection();

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
  "http://localhost:5173",
  "http://localhost:5174",
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Middlewares
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File Upload
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}));

// API Routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointments", appointmentRouter);

// Error Handling
app.use(errorMiddleware);

// Server Configuration
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// }).on('error', (err) => {
//   if (err.code === 'EADDRINUSE') {
//     console.error(`Port ${PORT} is already in use`);
//     process.exit(1);
//   }
// });

export default app;
