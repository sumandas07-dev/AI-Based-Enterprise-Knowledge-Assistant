import { envConfig } from "../config/envConfig.js";

import transporter from "../config/mail.js";

export const sendEmployeeCredentialsToMail = async ({
    email,
    name,
    temporaryPassword,
}) => {
    await transporter.sendMail({
        from: `"Enterprise Assistant" <${envConfig.SMTP_USER}>`,
        to: email,
        subject: "Your Employee Account Credentials",
        html: `
            <h2>Welcome, ${name}!</h2>

            <p>Your employee account has been created.</p>

            <p><strong>Login Email:</strong> ${email}</p>

            <p>
                <strong>Temporary Password:</strong>
                ${temporaryPassword}
            </p>

            <p>
                Please log in using these credentials.
                Since this is your first login, you will be
                required to change your password.
            </p>

            <p>
                <strong>Important:</strong>
                Do not share these credentials with anyone.
            </p>
        `,
    });
};