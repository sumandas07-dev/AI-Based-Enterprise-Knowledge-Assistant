import { Router } from "express";

import {
    importEmployees,
    createEmployeeController
} from "../controllers/employee.controller.js";
import { uploadExcel } from "../middleware/upload.middleware.js";

const router = Router();

router.post("/", createEmployeeController);

router.post("/import", uploadExcel, importEmployees);

export default router;