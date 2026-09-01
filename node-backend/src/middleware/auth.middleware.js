import { verifyAccessToken } from "../utils/jwt.js";
import Employee from "../models/employee.schema.js";


const authenticateUser = async (req, res, next) => {
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

const requireAdmin = (req, res, next) => {
    if (req.user?.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin role required.",
        });
    }
    next();
};

const requireEmployee = (req, res, next) => {
    if (req.user?.role !== "employee" && req.user?.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Employee role required.",
        });
    }
    next();
};


export {
    authenticateUser,
    requireAdmin,
    requireEmployee,
};