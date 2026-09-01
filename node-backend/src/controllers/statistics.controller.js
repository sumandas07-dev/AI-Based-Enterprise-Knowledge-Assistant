import Employee from "../models/employee.schema.js";
import Document from "../models/document.schema.js";
import Chat from "../models/chat.schema.js";

// Fetch system statistics for Admin Dashboard
export const getStatisticsController = async (req, res, next) => {
    try {
        const totalEmployees = await Employee.countDocuments();
        const activeEmployees = await Employee.countDocuments({ isActive: true });
        const inactiveEmployees = await Employee.countDocuments({ isActive: false });

        const totalDocuments = await Document.countDocuments();
        const indexedDocuments = await Document.countDocuments({ status: "completed" });
        const failedDocuments = await Document.countDocuments({ status: "failed" });
        const processingDocuments = await Document.countDocuments({ status: "processing" });

        const totalChats = await Chat.countDocuments();

        return res.status(200).json({
            success: true,
            statistics: {
                totalEmployees,
                activeEmployees,
                inactiveEmployees,
                totalDocuments,
                indexedDocuments,
                failedDocuments,
                processingDocuments,
                totalChats
            }
        });
    } catch (error) {
        next(error);
    }
};
