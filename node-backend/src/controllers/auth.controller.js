import {
    createAdmin,
    loginUser,
    resetUserPassword,
    refreshUserAccessToken,
    logoutUser,
    forgotPassword as forgotPasswordService,
    verifyOtp as verifyOtpService,
} from "../services/auth.service.js";

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
};

export const signupAdmin = async (req, res, next) => {
    try {
        const result = await createAdmin(req.body);

        res.status(201).json(result);
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const result = await loginUser(req.body);

        res.cookie("accessToken", result.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Login Successfully...",
            requiresPasswordReset: result.requiresPasswordReset,
        });
    } catch (error) {
        next(error);
    }
};

export const resetPassword = async (req, res, next) => {
    try {
        const result = await resetUserPassword(req.body);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        const result = await refreshUserAccessToken({
            refreshToken,
        });

        res.cookie("accessToken", result.accessToken, {
            ...cookieOptions,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", result.refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({
            message: "Access token refreshed",
        });
    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        await logoutUser({
            refreshToken,
        });

        res.clearCookie("accessToken", cookieOptions);
        res.clearCookie("refreshToken", cookieOptions);

        res.status(200).json({
            message: "Logged out successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const forgotPassword = async (req, res, next) => {
    try {
        const result = await forgotPasswordService(req.body);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const verifyOtp = async (req, res, next) => {
    try {
        const result = await verifyOtpService(req.body);

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};