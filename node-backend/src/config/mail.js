import nodemailer from "nodemailer";
import { envConfig } from "./envConfig.js";

const transporter = nodemailer.createTransport({
    host: envConfig.SMTP_HOST,
    port: envConfig.SMTP_PORT,
    secure: envConfig.SMTP_PORT === 465,
    auth: {
        user: envConfig.SMTP_USER,
        pass: envConfig.SMTP_PASS,
    },
});

export default transporter;