import mongoose from "mongoose";
import validator from 'validator';  // Default import

const { isEmail } = validator;     // Destructure to get isEmail


const appointmentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "First Name must contain at least 3 characters"],
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3, "Last Name must contain at least 3 characters"],
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: isEmail,
            message: "Please provide a valid email!",
        },
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{11}$/, "Phone number must contain exactly 11 digits!"],
    },
    nic: {
        type: String,
        required: true,
        match: [/^\d{13}$/, "NIC must contain exactly 13 digits!"],
    },
    dob: {
        type: Date,
        required: [true, "DOB is required"],
    },
    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female"],
    },
    appointment_date: {
        type: String,
        required : true,
    },
    department : {
        type : String,
        required : true,
    },
    doctor:{
        firstName:{
            type: String,
            required : true,
        },
        lastName:{
            type: String,
            required : true,
        }
    },
    hasVisited: {
        type :  Boolean,
        default:false,
    },
    doctorId:{
        type : mongoose.Schema.ObjectId,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending","Accepted", "Rejected"],
        default: "Pending",
    },
});

export const Appointment = mongoose.model("Appointment",appointmentSchema);