import axios from "axios";
import Document from "../models/document.schema.js";
import { uploadPDFToCloudinary, deletePDFFromCloudinary } from "./cloudinary.service.js";

const AI_SERVICE_URL = "http://127.0.0.1:8001";

// Helper to extract Cloudinary Public ID from URL
const getPublicIdFromUrl = (url) => {
    try {
        const parts = url.split("/upload/");
        if (parts.length > 1) {
            const pathParts = parts[1].split("/");
            if (pathParts[0].startsWith("v")) {
                pathParts.shift(); // Remove version part
            }
            return decodeURIComponent(pathParts.join("/"));
        }
        return null;
    } catch (e) {
        console.error("Failed to parse Cloudinary URL for publicId:", e);
        return null;
    }
};

// Fetch documents list based on role
export const getDocuments = async (role) => {
    // Employees are read-only and only see completed documents. Admins see all.
    let filter = {};
    if (role === "employee") {
        filter = { status: "completed" };
    }
    return await Document.find(filter).sort({ createdAt: -1 }).populate("uploadedBy", "name email").lean();
};

// Fetch single document
export const getDocumentById = async (id, role) => {
    const doc = await Document.findById(id).populate("uploadedBy", "name email").lean();
    if (!doc) {
        throw new Error("Document not found");
    }
    if (role === "employee" && doc.status !== "completed") {
        throw new Error("Access denied. Document is still processing.");
    }
    return doc;
};

// Upload document, save processing status, and trigger python ingest
export const uploadDocument = async (fileBuffer, filename, adminId) => {
    // 1. Upload file to Cloudinary
    const cloudinaryUpload = await uploadPDFToCloudinary(fileBuffer, filename);

    // 2. Create document record in MongoDB
    const doc = await Document.create({
        filename,
        cloudinaryUrl: cloudinaryUpload.url,
        uploadedBy: adminId,
        status: "processing"
    });

    // 3. Trigger ingestion in Python AI Service asynchronously
    try {
        console.log(`Ingesting document into vector DB: ${filename} (ID: ${doc._id})`);
        
        const response = await axios.post(`${AI_SERVICE_URL}/ingest`, {
            file_url: cloudinaryUpload.url,
            document_id: doc._id.toString(),
            filename: filename
        }, { timeout: 180000 }); // 3 minute timeout for RAG vectorization

        if (response.status === 200 || response.status === 201) {
            doc.status = "completed";
            await doc.save();
            console.log(`Successfully ingested: ${filename}`);
        } else {
            throw new Error(`Ingest service returned status code ${response.status}`);
        }
    } catch (error) {
        console.error(`Ingest failed for ${filename}:`, error.message);
        doc.status = "failed";
        await doc.save();
    }

    return doc;
};

// Delete document from MongoDB, Cloudinary, and Vector database
export const deleteDocument = async (id) => {
    const doc = await Document.findById(id);
    if (!doc) {
        throw new Error("Document not found");
    }

    // 1. Delete from Vector Database (Python service)
    try {
        console.log(`Deleting vectors for document ID: ${id}`);
        await axios.delete(`${AI_SERVICE_URL}/documents/${id}`);
    } catch (error) {
        console.error(`Failed to delete vectors for document ${id}:`, error.message);
    }

    // 2. Delete from Cloudinary
    const publicId = getPublicIdFromUrl(doc.cloudinaryUrl);
    if (publicId) {
        try {
            console.log(`Deleting file from Cloudinary: ${publicId}`);
            await deletePDFFromCloudinary(publicId);
        } catch (error) {
            console.error(`Failed to delete Cloudinary asset:`, error.message);
        }
    }

    // 3. Delete from MongoDB
    await Document.deleteOne({ _id: id });
};
