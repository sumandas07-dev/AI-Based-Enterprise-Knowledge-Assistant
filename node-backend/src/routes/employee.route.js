import { Router } from "express";

import {
    importEmployees,
    createEmployeeController,
    getEmployeesController,
    getEmployeeByIdController,
    updateEmployeeController,
    toggleEmployeeStatusController,
    deleteEmployeeController,
} from "../controllers/employee.controller.js";

import { uploadExcel } from "../middleware/upload.middleware.js";
import { authenticateUser, requireAdmin } from "../middleware/auth.middleware.js";

const router = Router();

// Apply admin protection to all employee routes
router.use(authenticateUser, requireAdmin);

// View employee list
router.get("/", getEmployeesController);

// Create a single employee
router.post("/", createEmployeeController);

// Import employees from excel
router.post("/import", uploadExcel, importEmployees);

// View employee details
router.get("/:id", getEmployeeByIdController);

// Update employee
router.put("/:id", updateEmployeeController);

// Toggle active status
router.put("/:id/toggle-status", toggleEmployeeStatusController);

// Delete employee
router.delete("/:id", deleteEmployeeController);

export default router;