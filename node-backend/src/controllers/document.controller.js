import {
    getDocuments,
    getDocumentById,
    uploadDocument,
    deleteDocument
} from "../services/document.service.js";

// Retrieve list of documents
export const getDocumentsController = async (req, res, next) => {
    try {
        const role = req.user?.role;
        const documents = await getDocuments(role);
        
        return res.status(200).json({
            success: true,
            documents
        });
    } catch (error) {
        next(error);
    }
};

// Retrieve single document details
export const getDocumentByIdController = async (req, res, next) => {
    try {
        const { id } = req.params;
        const role = req.user?.role;
        const document = await getDocumentById(id, role);

        return res.status(200).json({
            success: true,
            document
        });
    } catch (error) {
        next(error);
    }
};

// Upload document (PDF format, admin only)
export const uploadDocumentController = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "PDF file is required"
            });
        }

        const adminId = req.user?.userId;
        const document = await uploadDocument(
            req.file.buffer,
            req.file.originalname,
            adminId
        );

        return res.status(201).json({
            success: true,
            message: "Document uploaded successfully",
            document
        });
    } catch (error) {
        next(error);
    }
};

// Delete document (admin only)
export const deleteDocumentController = async (req, res, next) => {
    try {
        const { id } = req.params;
        await deleteDocument(id);

        return res.status(200).json({
            success: true,
            message: "Document deleted successfully"
        });
    } catch (error) {
        next(error);
    }
};
