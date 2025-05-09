export const generateToken = (user, message, statusCode, res) => {
    const token = user.generateJsonWebToken();
    const cookieName = user.role === "Admin" ? "adminToken" : "patientToken";
    
    // Default to 15 days if COOKIE_EXPIRE is missing
    const expiresInDays = process.env.COOKIE_EXPIRE || 15;
    const expires = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    // Secure should be true only in production
    const secureFlag = process.env.NODE_ENV === "production";

    res.status(statusCode)
       .cookie(cookieName, token, {
           expires,
           httpOnly: true,
           secure: secureFlag,
           sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax"
       })
       .json({
           success: true,
           message,
           user: {
               _id: user._id,
               email: user.email,
               role: user.role
           }
       });
};