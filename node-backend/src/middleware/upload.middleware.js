import multer from "multer";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowedExtensions = [".xlsx", ".xls"];

    const extension = file.originalname
        .toLowerCase()
        .slice(file.originalname.lastIndexOf("."));

    if (allowedExtensions.includes(extension)) {
        cb(null, true);
    } else {
        cb(new Error("Only Excel files are allowed"));
    }
};

export const uploadExcel = multer({
    storage,
    fileFilter,
}).single("file");

// Multer filter allowing only PDF documents
export const uploadDocument = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedExtensions = [".pdf"];
        const extension = file.originalname
            .toLowerCase()
            .slice(file.originalname.lastIndexOf("."));
        if (allowedExtensions.includes(extension)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
}).single("file");