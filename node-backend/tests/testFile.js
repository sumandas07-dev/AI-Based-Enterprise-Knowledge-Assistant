// import path from "path";

// import { uploadExcelToCloudinary } from "../src/services/cloudinary.service.js";
// import { createEmployeesFromExcel } from "../src/services/employee.service.js";

// const filePath = path.resolve(
//     process.cwd(),
//     "employees_10.xlsx"
// );

// try {
//     console.log("Starting employee import test...\n");

//     // 1. Upload local Excel file to Cloudinary
//     console.log("Uploading Excel to Cloudinary...");

//     const cloudinaryFile = await uploadExcelToCloudinary(
//         filePath
//     );

//     console.log("Excel uploaded successfully!");
//     console.log("Cloudinary URL:");
//     console.log(cloudinaryFile.url);

//     // 2. Download Excel from Cloudinary
//     // 3. Read Excel
//     // 4. Create employees in MongoDB
//     console.log("\nProcessing employees from Cloudinary...");

//     const result = await createEmployeesFromExcel(
//         cloudinaryFile.url
//     );

//     console.log("\nEmployee import successful!");
//     console.log(result);

// } catch (error) {
//     console.error("\nEmployee import failed!");
//     console.error(error.message);

//     process.exit(1);
// }


import fs from "fs";
import path from "path";

const filePath = path.resolve(
    process.cwd(),
    "employees_10.xlsx"
);

const formData = new FormData();

const fileBuffer = fs.readFileSync(filePath);

const file = new File(
    [fileBuffer],
    "employees_10.xlsx",
    {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
);

formData.append("file", file);

try {
    console.log("Sending Excel to Node backend...\n");

    const response = await fetch(
        "http://localhost:5000/employees/import",
        {
            method: "POST",
            body: formData,
        }
    );

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("\nResponse:");
    console.log(JSON.stringify(data, null, 2));

} catch (error) {
    console.error("Request failed:");
    console.error(error.message);
}