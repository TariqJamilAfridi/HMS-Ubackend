class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const errorMiddleware = (err, req, res, next) => {
    err.message = err.message || "Internal Server Error";
    err.statusCode = err.statusCode || 500;

    // Handle Mongoose validation errors
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((error) => error.message).join(", ");
        err = new ErrorHandler(message, 400);
    }

    // Handle duplicate key errors (Mongoose)
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue || {}).join(", ")} entered.`;
        err = new ErrorHandler(message, 400);
    }

    // Handle JWT-related errors
    if (["JsonWebTokenError", "TokenExpiredError"].includes(err.name)) {
        const message = err.name === "TokenExpiredError" 
            ? "Json Web Token has expired, Try Again!" 
            : "Json Web Token is invalid, Try Again!";
        err = new ErrorHandler(message, 400);
    }

    // Handle CastError (invalid IDs or paths in Mongoose queries)
    if (err.name === "CastError") {
        const message = `Invalid ${err.path}: ${err.value || "unknown value"}`;
        err = new ErrorHandler(message, 400);
    }

    // Construct final error message
    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
};

export default ErrorHandler;
