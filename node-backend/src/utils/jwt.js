import jwt from "jsonwebtoken";
import { envConfig } from "../config/envConfig.js";

export const generateAccessToken = (payload) => {
    return jwt.sign(
        payload,
        envConfig.JWT_ACCESS_SECRET,
        {
            expiresIn: "15m",
        }
    );
};

export const generateRefreshToken = (payload) => {
    return jwt.sign(
        {
            ...payload,
            jti: crypto.randomUUID(), // jti: JWT ID ( unique identifier for the token)

        },
        envConfig.JWT_REFRESH_SECRET,
        {
            expiresIn: "7d",
        }
    );
};

export const verifyAccessToken = (token) => {
    return jwt.verify(
        token,
        envConfig.JWT_ACCESS_SECRET
    );
};

export const verifyRefreshToken = (token) => {
    return jwt.verify(
        token,
        envConfig.JWT_REFRESH_SECRET
    );
};