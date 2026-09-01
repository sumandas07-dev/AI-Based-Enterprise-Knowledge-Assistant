import { Router } from "express";
import {
    getDocumentsController,
    getDocumentByIdController,
    uploadDocumentController,
    deleteDocumentController
} from "../controllers/document.controller.js";

import { uploadDocument } from "../middleware/upload.middleware.js";
import { authenticateUser, requireAdmin, requireEmployee } from "../middleware/auth.middleware.js";

const router = Router();

// Retrieve all completed documents (accessible by both roles)
router.get("/", authenticateUser, requireEmployee, getDocumentsController);

// Retrieve single document details (accessible by both roles)
router.get("/:id", authenticateUser, requireEmployee, getDocumentByIdController);

// Upload new PDF document (admin only)
router.post("/", authenticateUser, requireAdmin, uploadDocument, uploadDocumentController);

// Delete a document (admin only)
router.delete("/:id", authenticateUser, requireAdmin, deleteDocumentController);

export default router;
