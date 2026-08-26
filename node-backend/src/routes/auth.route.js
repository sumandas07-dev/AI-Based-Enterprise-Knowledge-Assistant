import { Router } from "express";
import {
    login,
    resetPassword,
    refreshAccessToken,
    logout,
    forgotPassword,
    verifyOtp,
    signupAdmin,
} from "../controllers/auth.controller.js";

const router = Router();

// Admin Sign Up
router.post("/admin/signup", signupAdmin);

// User Login
router.post("/admin/login", login);

// Reset Password
router.post("/admin/reset-password", resetPassword);

// Refresh Access Token
router.post("/admin/refresh", refreshAccessToken);

// Logout User
router.post("/admin/logout", logout);

// Forgot Password
router.post("/admin/forgot-password", forgotPassword);

// Verify OTP
router.post("/admin/verify-otp", verifyOtp);

// // // // // // // // // // // // // // // // // // 

// Employee Login
router.post("/employee/login", login);

// Reset Password
router.post("/employee/reset-password", resetPassword);

// Refresh Access Token
router.post("/employee/refresh", refreshAccessToken);

// Logout User
router.post("/employee/logout", logout);

// Forgot Password
router.post("/employee/forgot-password", forgotPassword);

// Verify OTP
router.post("/employee/verify-otp", verifyOtp);

export default router;