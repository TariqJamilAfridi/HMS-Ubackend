import statuses from "statuses";
const { message } = statuses;

import { catchAsyncErrors} from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";
import { User } from "../models/userSchema.js";
// import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
// import ErrorHandler from "../middlewares/errorMiddleware.js";
// import { Appointment } from "../models/appointmentSchema.js";
// import { User } from "../models/userSchema.js";

export const postAppointment = catchAsyncErrors(async (req, res, next) => {
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

    // Validate all required fields
    if (!firstName || !lastName || !email || !phone || !nic || !dob || 
        !gender || !appointment_date || !department || !doctor_firstName || 
        !doctor_lastName || !address) {
        return next(new ErrorHandler("Please fill all required fields", 400));
    }

    // Verify doctor exists
    const doctors = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department,
    });

    if (doctors.length === 0) {
        return next(new ErrorHandler("Doctor not found", 404));
    }
    if (doctors.length > 1) {
        return next(new ErrorHandler("Multiple doctors found - please contact clinic", 400));
    }

    // Create appointment
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
        doctorId: doctors[0]._id,
        patientId: req.user._id // Now safe with authentication middleware
    });

    res.status(201).json({
        success: true,
        message: "Appointment booked successfully",
        appointment,
    });
});

// Other controller functions remain same...
export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
  const appointments = await Appointment.find()
    .populate({
      path: "doctorId",
      select: "firstName lastName",
      model: "User"
    })
    .populate({
      path: "patientId",
      select: "firstName lastName",
      model: "User"
    });

  res.status(200).json({
    success: true,
    appointments
  });
});

export const updateAppointmentStatus = catchAsyncErrors(async(req,res,next)=>{
    const { id } = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment){
        return next(new ErrorHandler("Appointment Not Found",404));
    }
    appointment = await Appointment.findByIdAndUpdate(id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    });
    res.status(200).json({
        success : true,
        message: "Appointment Status Update!",
        appointment,
    });
});

export const deleteAppointment = catchAsyncErrors(async(req, res, next)=>{
    const {id} = req.params;
    let appointment = await Appointment.findById(id);
    if (!appointment){
        return next(new ErrorHandler("Appointment Not Found",404));

    }
    await appointment.deleteOne();
    res.status(200).json({
        success : true,
        message: "Appointment Deleted!",
    });
})
