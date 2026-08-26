import crypto from "crypto";

import transporter from "../config/mail.js";
import { envConfig } from "../config/envConfig.js";

import Admin from "../models/admin.schema.js";
import Employee from "../models/employee.schema.js";

import { redisClient } from "../config/redisDB.js";

import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

// Sign-Up Admin
export const createAdmin = async (body) => {
    const {company_name, name, email, password } = body;

    if (!name || !email || !password) {
        throw new Error(
            "Name, email and password are required"
        );
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
        throw new Error("Admin already exists");
    }

    const passwordHash = await hashPassword(password);

    const admin = await Admin.create({
        company_name,
        name,
        email,
        passwordHash,
        role: "admin",
    });

    return {
        message: "Admin created successfully",
        adminId: admin._id,
    };
};

// login Admin / Emp Users
export const loginUser = async (body) => {
    const { loginType, email, password } = body;

    if (!loginType || !email || !password) {
        throw new Error("Login type, email and password are required");
    }

    let user;

    if (loginType === "admin") {
        user = await Admin.findOne({
            email: email,
        });
    } else if (loginType === "employee") {
        user = await Employee.findOne({
            email: email,
        });
    } else {
        throw new Error("Invalid login type");
    }

    if (!user) {
        throw new Error("Invalid credentials");
    }

    if (!user.isActive) {
        throw new Error("Account is inactive");
    }

    const isPasswordValid = await comparePassword(
        password,
        user.passwordHash
    );

    if (!isPasswordValid) {
        throw new Error("Invalid credentials");
    }

    const payload = {
        userId: user._id,
        role: user.role,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    const decodedRefreshToken = verifyRefreshToken(refreshToken);
    // console.log("decodedRefreshToken", decodedRefreshToken);

    await redisClient.set(
        `refresh:${decodedRefreshToken.jti}`,
        user._id.toString(),
        {
            EX: 7 * 24 * 60 * 60, // 7 days
        }
    );

    return {
        accessToken,
        refreshToken,
        requiresPasswordReset:
            loginType === "employee" && user.isFirstLogin,
    };
};

// Reset Password
export const resetUserPassword = async (body) => {
    const {
        loginType,
        email,
        currentPassword,
        resetToken,
        newPassword,
    } = body;

    if (!loginType || !email || !newPassword) {
        throw new Error(
            "Login type, email and new password are required"
        );
    }

    if (!currentPassword && !resetToken) {
        throw new Error(
            "Current password or reset token is required"
        );
    }

    if (currentPassword && resetToken) {
        throw new Error(
            "Provide either current password or reset token, not both"
        );
    }

    let user;

    if (loginType === "admin") {
        user = await Admin.findOne({ email });
    } else if (loginType === "employee") {
        user = await Employee.findOne({ email });
    } else {
        throw new Error("Invalid login type");
    }

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.isActive) {
        throw new Error("Account is inactive");
    }

    // First-login / current-password reset
    if (currentPassword) {
        const isPasswordValid = await comparePassword(
            currentPassword,
            user.passwordHash
        );

        if (!isPasswordValid) {
            throw new Error("Current password is incorrect");
        }
    }

    // Forgot-password reset
    let hashedResetToken;

    if (resetToken) {
        hashedResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        const resetData = await redisClient.get(
            `password-reset:${hashedResetToken}`
        );

        if (!resetData) {
            throw new Error("Invalid or expired reset token");
        }

        const parsedData = JSON.parse(resetData);

        if (
            parsedData.loginType !== loginType ||
            parsedData.email !== email
        ) {
            throw new Error("Invalid reset token");
        }
    }

    const newPasswordHash = await hashPassword(newPassword);

    user.passwordHash = newPasswordHash;

    if (loginType === "employee") {
        user.isFirstLogin = false;
    }

    await user.save();

    // Delete reset token only after password is successfully saved
    if (hashedResetToken) {
        await redisClient.del(
            `password-reset:${hashedResetToken}`
        );
    }

    return {
        isFirstLogin: user.isFirstLogin,
        message: "Password reset successfully",
    };
};

// Take the refresh token , verify it , and create a new Access Token
export const refreshUserAccessToken = async (body) => {
    const { refreshToken } = body;

    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }

    const decoded = verifyRefreshToken(refreshToken);

    const storedUserId = await redisClient.get(
        `refresh:${decoded.jti}`
    );

    if (!storedUserId) {
        throw new Error("Invalid or expired refresh token");
    }

    if (storedUserId !== decoded.userId.toString()) {
        throw new Error("Invalid refresh token");
    }

    // Invalidate old refresh token
    await redisClient.del(`refresh:${decoded.jti}`);

    const payload = {
        userId: decoded.userId,
        role: decoded.role,
    };

    const accessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    const newDecoded = verifyRefreshToken(newRefreshToken);

    await redisClient.set(
        `refresh:${newDecoded.jti}`,
        decoded.userId.toString(),
        {
            EX: 7 * 24 * 60 * 60,
        }
    );

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
};

// Logout user
export const logoutUser = async (body) => {
    const { refreshToken } = body;

    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }

    const decoded = verifyRefreshToken(refreshToken);

    await redisClient.del(`refresh:${decoded.jti}`);

    return {
        message: "Logged out successfully",
    };
};

// Forgot Password
export const forgotPassword = async (body) => {
    const { loginType, email } = body;

    if (!loginType || !email) {
        throw new Error("Login type and email are required");
    }

    let user;

    if (loginType === "admin") {
        user = await Admin.findOne({ email });
    } else if (loginType === "employee") {
        user = await Employee.findOne({ email });
    } else {
        throw new Error("Invalid login type");
    }

    if (!user) {
        throw new Error("User not found");
    }

    if (!user.isActive) {
        throw new Error("Account is inactive");
    }

    // OTP generation and email sending
    const otp = crypto.randomInt(100000, 1000000).toString();

    const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    await redisClient.set(
        `otp:${loginType}:${email}`,
        hashedOtp,
        {
            EX: 10 * 60, // 10 minutes
        }
    );

    // Send the OTP to user's email
    await transporter.sendMail({
        from: envConfig.SMTP_USER,
        to: user.email,
        subject: "Password Reset OTP",
        text: `Your password reset OTP is ${otp}. It is valid for 10 minutes.`,
    });

    return {
        message: "OTP sent successfully",
    };
};

// Verify OTP
export const verifyOtp = async (body) => {
    const { loginType, email, otp } = body;

    if (!loginType || !email || !otp) {
        throw new Error("Login type, email and OTP are required");
    }

    const storedHashedOtp = await redisClient.get(
        `otp:${loginType}:${email}`
    );

    if (!storedHashedOtp) {
        throw new Error("OTP expired or not found");
    }

    const hashedOtp = crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");

    if (hashedOtp !== storedHashedOtp) {
        throw new Error("Invalid OTP");
    }

    // OTP is valid → remove it
    await redisClient.del(`otp:${loginType}:${email}`);

    // Create temporary password-reset authorization
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await redisClient.set(
        `password-reset:${hashedResetToken}`,
        JSON.stringify({
            loginType,
            email,
        }),
        {
            EX: 10 * 60, // 10 minutes
        }
    );

    return {
        message: "OTP verified successfully",
        resetToken,
    };
};

