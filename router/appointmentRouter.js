import statuses from "statuses";
const { message } = statuses;
import express from 'express';
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
import { 
    isPatientAuthenticated,  // Add this import
    isAdminAuthenticated 
} from "../middlewares/auth.js";
const router = express.Router();
// import { isAdminAuthenticated } from "../middlewares/auth.js";


// POST - Create Appointment
router.post(
    "/",
    isPatientAuthenticated,  // Add this middleware FIRST
    catchAsyncErrors(async (req, res, next) => {
    const {
        firstName,
        lastName,
        email,
        phone,
        nic,
        dob,
        gender,
        appointment_date,
        department,
        doctor_firstName,
        doctor_lastName,
        hasVisited,
        address,
    } = req.body;

    if (!firstName || !lastName || !email || !phone || !nic || !dob || 
        !gender || !appointment_date || !department || !doctor_firstName || 
        !doctor_lastName || !address) {
        return next(new ErrorHandler("Please fill all required fields", 400));
    }

    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department,
    });

    if (isConflict.length === 0) {
        return next(new ErrorHandler("Doctor not found", 404));
    }
    if (isConflict.length > 1) {
        return next(new ErrorHandler("Doctor conflict! Please contact via email/phone", 404));
    }

    const doctorId = isConflict[0]._id;
    const patientId = req.user._id;

    const appointment = await Appointment.create({
        firstName,
        lastName,
        email,
        phone,
        nic,
        dob,
        gender,
        appointment_date,
        department,
        doctor: {
            firstName: doctor_firstName,
            lastName: doctor_lastName,
        },
        hasVisited,
        address,
        doctorId,
        patientId
    });
    
    res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        appointment,
    });
}));

// GET - All Appointments
router.get("/admin/allappointments", isAdminAuthenticated, catchAsyncErrors(async (req, res, next) => {
    const appointments = await Appointment.find()
        .populate({
            path: "doctorId",
            select: "firstName lastName"
        })
        .populate({
            path: "patientId", 
            select: "firstName lastName"
        });
    
    res.status(200).json({
        success: true,
        appointments,
    });
}));

// PUT - Update Appointment Status
router.put("/update/:id", isAdminAuthenticated, catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndUpdate(
        id,
        { status: req.body.status },
        { new: true, runValidators: true }
    ).populate('doctorId patientId');

    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Appointment status updated",
        appointment,
    });
}));

// DELETE - Appointment

router.delete("/delete/:id", isAdminAuthenticated, catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
        return next(new ErrorHandler("Appointment not found", 404));
    }

    res.status(200).json({
        success: true,
        message: "Appointment deleted successfully",
    });
}));

export { router as appointmentRouter };