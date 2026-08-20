import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// ============================================
// CLOUDINARY CONFIG
// ============================================

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});


// ============================================
// MAIN
// ============================================

async function testUpload() {

    try {

        // ========================================
        // PDF PATH
        // ========================================

        const pdfPath = path.join(
            __dirname,
            "..",
            "pdf",
            "2312.10997v5.pdf"
        );


        // ========================================
        // DOCUMENT INFORMATION
        // ========================================

        const filename = path.basename(pdfPath);

        const documentId = randomUUID();


        // ========================================
        // DETERMINISTIC PUBLIC ID
        // ========================================
        //
        // IMPORTANT:
        // Raw assets must contain the extension
        // in their public_id.
        //
        // Same filename => same Cloudinary asset
        //

        const publicId =
            `enterprise-documents/${filename}`;


        console.log("\n========================================");
        console.log("CLOUDINARY UPLOAD TEST");
        console.log("========================================");

        console.log(`Filename    : ${filename}`);
        console.log(`Public ID   : ${publicId}`);
        console.log(`Document ID : ${documentId}`);


        let asset;


        // ========================================
        // STEP 1
        // CHECK WHETHER ASSET EXISTS
        // ========================================

        console.log("\nChecking Cloudinary...");


        try {

            asset = await cloudinary.api.resource(
                publicId,
                {
                    resource_type: "raw",
                    type: "authenticated",
                }
            );


            // ====================================
            // EXISTS
            // ====================================

            console.log(
                "\n========================================"
            );

            console.log(
                "FILE ALREADY EXISTS"
            );

            console.log(
                "========================================"
            );

            console.log(
                `Public ID     : ${asset.public_id}`
            );

            console.log(
                `Resource Type : ${asset.resource_type}`
            );

            console.log(
                `Delivery Type : ${asset.type}`
            );

            console.log(
                "Upload skipped."
            );


        } catch (error) {

            const statusCode =
                error?.http_code ??
                error?.error?.http_code;


            console.log(
                `Cloudinary check returned: ${statusCode}`
            );


            // ====================================
            // NOT FOUND
            // ====================================

            if (statusCode === 404) {

                console.log(
                    "\n========================================"
                );

                console.log(
                    "FILE NOT FOUND"
                );

                console.log(
                    "Uploading..."
                );

                console.log(
                    "========================================"
                );


                asset = await cloudinary.uploader.upload(
                            pdfPath,
                            {
                                resource_type: "raw",
                                type: "authenticated",

                                public_id: publicId,

                                // This controls the Media Library folder
                                asset_folder: "enterprise-documents",

                                overwrite: false,
                            }
                        );


                console.log(
                    "\nUpload successful."
                );

                console.log(
                    `Public ID : ${asset.public_id}`
                );

            } else {

                console.error(
                    "\nCloudinary check failed:"
                );

                console.error(error);

                throw error;
            }
        }


        // ========================================
        // STEP 2
        // VERIFY ASSET TYPE
        // ========================================

        console.log(
            "\n========== CLOUDINARY ASSET =========="
        );

        console.log(
            `Public ID     : ${asset.public_id}`
        );

        console.log(
            `Resource Type : ${asset.resource_type}`
        );

        console.log(
            `Delivery Type : ${asset.type}`
        );


        // ========================================
        // SAFETY CHECK
        // ========================================
        //
        // We expect:
        //
        // resource_type = raw
        // type          = authenticated
        //

        if (asset.resource_type !== "raw") {

            throw new Error(
                `Expected raw asset but got ${asset.resource_type}`
            );
        }


        if (asset.type !== "authenticated") {

            throw new Error(
                `Expected authenticated asset but got ${asset.type}`
            );
        }


        // ========================================
        // STEP 3
        // GENERATE 10-MINUTE DOWNLOAD URL
        // ========================================

        const expiresAt =
            Math.floor(Date.now() / 1000) + (10 * 60);


        /*
         * IMPORTANT:
         *
         * Do NOT use:
         *
         * cloudinary.url(...)
         *
         * here.
         *
         * private_download_url() creates the
         * time-limited signed download URL.
         */

        const downloadUrl =
            cloudinary.utils.private_download_url(
                asset.public_id,
                "pdf",
                {
                    resource_type: "raw",

                    type: "authenticated",

                    expires_at: expiresAt,
                }
            );


        // ========================================
        // STEP 4
        // PRINT URL
        // ========================================

        console.log(
            "\n========== DOWNLOAD URL =========="
        );

        console.log(downloadUrl);

        console.log(
            `\nExpires at (Unix) : ${expiresAt}`
        );

        console.log(
            `Valid for         : 10 minutes`
        );


        // ========================================
        // STEP 5
        // DATA TO AI SERVICE
        // ========================================

        console.log(
            "\n========== DATA TO PYTHON =========="
        );

        console.log({
            document_id: documentId,
            filename: filename,
            file_url: downloadUrl,
        });


        // ========================================
        // DONE
        // ========================================

        console.log(
            "\n========================================"
        );

        console.log(
            "DONE"
        );

        console.log(
            "========================================"
        );


    } catch (error) {

        console.error(
            "\n========== ERROR =========="
        );

        console.error(error);

        process.exitCode = 1;
    }
}


testUpload();