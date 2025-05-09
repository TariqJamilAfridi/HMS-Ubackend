import statuses from "statuses";
const { message } = statuses;

import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

// Patient Registration
export const patientRegister = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, password, gender, dob, nic, role } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !role) {
        return next(new ErrorHandler("Please fill all fields!", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("User already registered!", 400));
    }

    const newUser = await User.create({
        firstName, lastName, email, phone, password, gender, dob, nic, role
    });

    generateToken(newUser, "User Registered!", 200, res);
});

// User Login
export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, confirmPassword, role } = req.body;

    if (!email || !password || !confirmPassword || !role) {
        return next(new ErrorHandler("Please provide all details!", 400));
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Passwords do not match!", 400));
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        return next(new ErrorHandler("Invalid credentials!", 400));
    }

    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid credentials!", 400));
    }

    if (role !== user.role) {
        return next(new ErrorHandler(`User with ${role} role not found!`, 400));
    }

    generateToken(user, "Login successful!", 200, res);
});

// Admin Management
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, password, gender, dob, nic } = req.body;
    const role = "Admin";

    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic) {
        return next(new ErrorHandler("Please fill all fields!", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} with this email already exists!`, 400));
    }

    await User.create({ firstName, lastName, email, phone, password, gender, dob, nic, role });

    res.status(200).json({
        success: true,
        message: "New admin registered"
    });
});

// Doctor Management
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
    const doctors = await User.find({ role: "Doctor" });
    res.status(200).json({
        success: true,
        doctors
    });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, password, gender, dob, nic, doctorDepartment } = req.body;

    if (!firstName || !lastName || !email || !phone || !password || !gender || !dob || !nic || !doctorDepartment) {
        return next(new ErrorHandler("Please provide all details!", 400));
    }

    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email!`, 400));
    }

    const doctor = await User.create({
        firstName, lastName, email, phone, password, gender, dob, nic, doctorDepartment, role: "Doctor"
    });

    res.status(200).json({
        success: true,
        message: "New doctor registered!",
        doctor
    });
});

// User Profile Management
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id).select("-password -__v");
    res.status(200).json({
        success: true,
        user
    });
});
// Add this controller above updateUserProfile
export const getPatientDetails = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.user.id)
                          .select("-password -__v");
    
    if (!user) {
        return next(new ErrorHandler("User not found", 404));
    }
    
    if (user.role !== "Patient") {
        return next(new ErrorHandler("Access restricted to patients", 403));
    }

    res.status(200).json({
        success: true,
        user
    });
});

export const updateUserProfile = catchAsyncErrors(async (req, res, next) => {
    const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        gender, 
        dob, 
        nic,
        currentPassword,
        newPassword,
        confirmPassword
    } = req.body;

    // Basic field validation
    if (!firstName || !lastName || !email || !phone) {
        return next(new ErrorHandler("Please provide required fields!", 400));
    }

    const user = await User.findById(req.user.id).select("+password");
    if (!user) {
        return next(new ErrorHandler("User not found!", 404));
    }

    // Update profile fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phone = phone;
    user.gender = gender;
    user.dob = dob;
    user.nic = nic;

    // Password update logic
    if (currentPassword || newPassword || confirmPassword) {
        if (!currentPassword) {
            return next(new ErrorHandler("Please enter current password", 400));
        }

        const isPasswordMatched = await user.comparePassword(currentPassword);
        if (!isPasswordMatched) {
            return next(new ErrorHandler("Current password is incorrect", 400));
        }

        if (newPassword !== confirmPassword) {
            return next(new ErrorHandler("Passwords don't match", 400));
        }

        if (newPassword.length < 8) {
            return next(new ErrorHandler("Password must be at least 8 characters", 400));
        }

        user.password = newPassword;
    }

    await user.save();
    user.password = undefined;

    res.status(200).json({
        success: true,
        message: "Profile updated successfully!",
        user
    });
});
// Logout Functions
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
    res.status(200)
       .cookie("adminToken", "", {
           httpOnly: true,
           expires: new Date(Date.now()),
           secure: true,
           sameSite: "None"
       })
       .json({
           success: true,
           message: "Admin logged out successfully!"
       });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
    res.status(200)
       .cookie("patientToken", "", {
           httpOnly: true,
           expires: new Date(Date.now()),
           secure: true,
           sameSite: "None"
       })
       .json({
           success: true,
           message: "Patient logged out successfully!"
       });
});