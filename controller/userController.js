import statuses from "statuses";
const { message } = statuses;

import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import {generateToken} from "../utils/jwtToken.js"
import cloudinary from "cloudinary"

export const patientRegister = catchAsyncErrors(async (req, res, next) => {
    const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        gender, 
        dob, 
        nic, 
        role 
    } = req.body;

    console.log("Request Body:", req.body); // Debug incoming data

    if (
        !firstName || 
        !lastName || 
        !email || 
        !phone || 
        !password || 
        !gender || 
        !dob || 
        !nic || 
        !role
    ) {
        return next(new ErrorHandler("Please fill Full Form!", 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new ErrorHandler("User Already Register!", 400));
    }

    const newUser = await User.create({
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        gender, 
        dob, 
        nic, 
        role,
    });

    generateToken(user, "User Registered !",200, res)
});

export const login = catchAsyncErrors(async (req, res, next) => {
    const { email, password, confirmPassword, role } = req.body;

    if (!email || !password || !confirmPassword || !role) {
        return next(new ErrorHandler("Please Provide All Details!", 400));
    }

    if (password !== confirmPassword) {
        return next(new ErrorHandler("Password and Confirm Password Do Not Match!", 400));
    }

    // Find the user by email and include the password field
    const user = await User.findOne({ email }).select("+password");
    console.log("User Retrieved:", user);

    if (!user) {
        return next(new ErrorHandler("Invalid Password or Email1", 400));
    }

    // Compare the provided password with the stored hashed password
    const isPasswordMatched = await user.comparePassword(password);
    console.log("Password Match Status:", isPasswordMatched);

    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid Password or Email2!", 400));
    }

    if (role !== user.role) {
        return next(new ErrorHandler("User with this role is not Found", 400));
    }

    generateToken(user, "User Login successfully !",200, res);
});
// here the code is writing for the Admin 
export const addNewAdmin = catchAsyncErrors(async(req, res, next)=>{
    const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        gender, 
        dob, 
        nic,
        role = "Admin"
    } = req.body;
    if (
        !firstName || 
        !lastName || 
        !email || 
        !phone || 
        !password || 
        !gender || 
        !dob || 
        !nic ||
        // here trhe will to be commit out  
        !role
    ) {
        return next(new ErrorHandler("Please fill Full Form!", 400));
    }
    const isRegistered = await User.findOne({email});
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} with this email already Exists!`));
    }
    const admin = await User.create({
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        gender, 
        dob, 
        nic,
        role
    });
    res.status(200).json ({
        success: true,
        message: "New Admin Registered",
    });

});

export const getAllDoctors = catchAsyncErrors(async(req, res, next)=>{
    const doctors = await User.find({role: "Doctor"});
    res.status(200).json({
        success : true,
        doctors,
    });
});

export const getUserDetails = catchAsyncErrors(async(req, res, next)=>{
    const user = req.user;
    res.status(200).json({
        success : true,
        user,
    });
});

export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
    res
        .status(200)
        .cookie("adminToken", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
            secure: true,
            sameSite:"None",
        })
        .json({ // Fixed typo here
            success: true,
            message: "Admin Logged Successfully!",
        });
});
export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
    res
        .status(200)
        .cookie("patientToken", "", {
            httpOnly: true,
            expires: new Date(Date.now()),
            secure: true,
            sameSite:"None",
        })
        .json({ // Fixed typo here
            success: true,
            message: "Patient Logged Out Successfully!",
        });
});

export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
    const { 
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        gender, 
        dob, 
        nic, 
        doctorDepartment 
    } = req.body;

    // Validate that all fields are provided
    if (
        !firstName || 
        !lastName || 
        !email || 
        !phone || 
        !password || 
        !gender || 
        !dob || 
        !nic || 
        !doctorDepartment
    ) {
        return next(new ErrorHandler("Please provide all required details!", 400));
    }

    // Check if the doctor is already registered
    const isRegistered = await User.findOne({ email });
    if (isRegistered) {
        return next(new ErrorHandler(`${isRegistered.role} already registered with this email!`, 400));
    }

    // Create the new doctor without avatar
    const doctor = await User.create({
        firstName, 
        lastName, 
        email, 
        phone, 
        password, 
        gender, 
        dob, 
        nic, 
        doctorDepartment,
        role: "Doctor"
    });

    res.status(200).json({
        success: true,
        message: "New Doctor Registered!",
        doctor
    });
});
