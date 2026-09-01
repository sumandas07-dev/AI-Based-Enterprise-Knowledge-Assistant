import cloudinary from "../config/cloudinary.js";

export const uploadExcelToCloudinary = async (fileBuffer) => {
    const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                folder: "employee-imports",
            },
            (error, result) => {
                if (error) {
                    console.error("CLOUDINARY ERROR:");
                    console.error(error);
                    reject(error);
                    return;
                }

                console.log("CLOUDINARY SUCCESS:");
                console.log(result);

                resolve(result);
            }
        );

        uploadStream.end(fileBuffer);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
};

export const deleteExcelFromCloudinary = async (publicId) => {
    const result = await cloudinary.uploader.destroy(
        publicId,
        {
            resource_type: "raw",
        }
    );

    console.log("CLOUDINARY DELETE RESULT:");
    console.log(result);

    if (result.result !== "ok") {
        throw new Error(
            "Failed to delete Excel file from Cloudinary"
        );
    }

    return result;
};

// Upload PDF to Cloudinary as raw format
export const uploadPDFToCloudinary = async (fileBuffer, originalFilename) => {
    const sanitizedFilename = originalFilename.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
    const publicId = `documents/${Date.now()}-${sanitizedFilename}`;
    
    const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                resource_type: "raw",
                public_id: publicId
            },
            (error, result) => {
                if (error) {
                    console.error("Cloudinary PDF upload error:", error);
                    reject(error);
                    return;
                }
                resolve(result);
            }
        );
        uploadStream.end(fileBuffer);
    });

    return {
        url: result.secure_url,
        publicId: result.public_id,
    };
};

// Delete PDF from Cloudinary
export const deletePDFFromCloudinary = async (publicId) => {
    const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: "raw"
    });
    if (result.result !== "ok" && result.result !== "not found") {
        throw new Error("Failed to delete PDF from Cloudinary");
    }
    return result;
};