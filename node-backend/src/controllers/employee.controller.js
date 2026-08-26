import { uploadExcelToCloudinary, deleteExcelFromCloudinary } from "../services/cloudinary.service.js";
import { createEmployee, createEmployeesFromExcel } from "../services/employee.service.js";


// Create a single employee
export const createEmployeeController = async (
    req,
    res,
    next
) => {
    try {

        const result = await createEmployee(
            req.body
        );

        res.status(201).json(result);

    } catch (error) {

        console.error(
            "CREATE EMPLOYEE ERROR:"
        );

        console.error(error);

        next(error);
    }
};


export const importEmployees = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new Error("Excel file is required");
        }

        // 1. Upload Excel
        const cloudinaryFile =
            await uploadExcelToCloudinary(
                req.file.buffer
            );

        // 2. Process Excel
        const result =
            await createEmployeesFromExcel(
                cloudinaryFile.url
            );

        // 3. Delete Excel after successful processing
        await deleteExcelFromCloudinary(
            cloudinaryFile.publicId
        );

        res.status(201).json({
            message: "Employees imported successfully",
            result,
        });

    } catch (error) {
        console.error(
            "IMPORT EMPLOYEES ERROR:"
        );
        console.error(error);

        next(error);
    }
};