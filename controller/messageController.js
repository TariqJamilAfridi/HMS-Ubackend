import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Message } from "../models/messageSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";

export const sendMessage = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone, message } = req.body;

    // Check if all fields are provided
    if (!firstName || !lastName || !email || !phone || !message) {
        return next(new ErrorHandler("Please fill out the entire form.", 400));
    }

    try {
        // Save the message in the database
        await Message.create({ firstName, lastName, email, phone, message });
        res.status(200).json({
            success: true,
            message: "Message sent successfully!",
        });
    } catch (err) {
        if (err.name === "ValidationError") {
            // Pass validation errors to the error middleware
            return next(err);
        }
        console.error("Error in sendMessage:", err); // Log other errors for debugging
        res.status(500).json({
            success: false,
            message: "An unexpected error occurred.",
        });
    }
});

export const getAllMessages = catchAsyncErrors(async(req, res, next)=>{
    const message = await Message.find();
    res.status(200).json({
        success: true,
        message,
    });

});