import { verifyAccessToken } from "../utils/jwt.js";


const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies?.accessToken;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const decoded = verifyAccessToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired access token",
            });
        }

        req.user = decoded;

        next();

    } catch (error) {
        console.error("Authentication middleware error:", error);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired access token",
        });
    }
};


export {
    authenticateUser,
};