import mongoose from "mongoose";
import isEmail from "validator/lib/isEmail.js";

const messageSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "First Name must contain at least 3 characters"]
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3, "Last Name must contain at least 3 characters"]
    },
    email: {
        type: String,
        required: true,
        validate: {
            validator: isEmail,
            message: "Please provide a valid email!"
        }
    },
    phone: {
        type: String,
        required: true,
        match: [/^\d{11}$/, "Phone number must contain exactly 11 digits!"]
    },
    message: {
        type: String,
        required: true,
        minLength: [10, "Message must contain at least 10 characters"]
    },
});

export const Message = mongoose.model("Message", messageSchema);
