import { User } from "../models/userSchema.js";
import { catchAsyncErrors } from "./catchAsyncErrors.js";
import ErrorHandler from "./errorMiddleware.js";
import jwt from "jsonwebtoken";

export const isAdminAuthenticated = catchAsyncErrors(async(req, res, next)=>{
    const token = req.cookies.adminToken;
    if (!token){
        return next(new ErrorHandler("Admin Not Authenticated!", 400));

    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = await User.findById(decoded.id);
    if (req.user.role !== "Admin") {
        return next(
            new ErrorHandler(
                `${req.user.role} not authorized for this resources!`,
                403
            )
        )
    }
    next();
});
// Example isPatientAuthenticated middleware
// auth.js - Critical Fixes
export const isPatientAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const token = req.cookies.patientToken; // Focus on cookies only for web clients
    
    if (!token) {
        return next(new ErrorHandler("Patient authentication required", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Verify secret key matches
    
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "Patient") { // Add role verification
        return next(new ErrorHandler("Invalid patient credentials", 403));
    }

    req.user = user;
    next();
});