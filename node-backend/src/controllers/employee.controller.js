import { uploadExcelToCloudinary, deleteExcelFromCloudinary } from "../services/cloudinary.service.js";
import {
    createEmployee,
    createEmployeesFromExcel,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    toggleEmployeeStatus,
    deleteEmployee,
} from "../services/employee.service.js";


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

// Fetch all employees
export const getEmployeesController = async (req, res, next) => {
    try {
        const { search } = req.query;
        const employees = await getEmployees(search || "");
        res.status(200).json({
            success: true,
            employees,
        });
    } catch (error) {
        next(error);
    }
};

// Fetch employee by ID
export const getEmployeeByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await getEmployeeById(id);
        res.status(200).json({
            success: true,
            employee,
        });
    } catch (error) {
        next(error);
    }
};

// Update employee details
export const updateEmployeeController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await updateEmployee(id, req.body);
        res.status(200).json({
            success: true,
            message: "Employee updated successfully",
            employee,
        });
    } catch (error) {
        next(error);
    }
};

// Toggle active status
export const toggleEmployeeStatusController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const employee = await toggleEmployeeStatus(id);
        res.status(200).json({
            success: true,
            message: "Employee status toggled successfully",
            employee,
        });
    } catch (error) {
        next(error);
    }
};

// Delete employee
export const deleteEmployeeController = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteEmployee(id);
        res.status(200).json({
            success: true,
            message: "Employee deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};