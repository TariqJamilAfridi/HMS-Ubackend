import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnection } from "./database/dbConnection.js";
 // Ensure this path is correct
import fileUpload from 'express-fileupload';
import messageRouter from "./router/messageRouter.js"; // Ensure this path is correct
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import userRouter from "./router/userRouter.js"
import appointmentRouter from "./router/appointmentRouter.js"

const app = express();
// here we can saw that we can connect the config.env with the app.js which can give the response on the to run the server.js

config({ path: "./config/config.env" }); // Ensure your .env file path is correct

// here we can saw that this is a middle ware in order to connect the FRONT_END
// At the very top of your middleware chain
// Replace cors() with this manual implementation
// Manual CORS handler (MUST be first middleware)


// 🟢 Replace existing CORS config with this:
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.DASHBOARD_URL,
  "https://hms-ufrontedtjaa.vercel.app",
  "https://hms-udaskboardtja.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  exposedHeaders: ['Content-Type', 'Authorization']
}));



// ✅ Step 2: Handle preflight (OPTIONS) requests
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// The above lines can saw that we can successfully connect the FRONT_END to the BACK_END just we can check by sending some request 

// The below all we can saw that it is the middle layers

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File upload configuration
app.use(
    fileUpload({
        useTempFiles: true,
        tempFileDir: "/tmp/",
    })
);

// // API routes
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/appointment", appointmentRouter);

// Database connection
dbConnection();
app.use(errorMiddleware);

export default app;
