import crypto from "crypto";
import XLSX from "xlsx";

import Employee from "../models/employee.schema.js";
import { hashPassword } from "../utils/hash.js";
import { sendEmployeeCredentialsToMail } from "./email.service.js";

export const createEmployee = async (body) => {
    const {
        empId,
        department,
        name,
        email,
    } = body;

    if (!empId || !name || !email) {
        throw new Error(
            "Employee ID, name and email are required"
        );
    }

    const existingEmployee = await Employee.findOne({
        $or: [
            { empId },
            { email },
        ],
    });

    if (existingEmployee) {
        throw new Error(
            "Employee ID or email already exists"
        );
    }

    // Generate temporary password
    const temporaryPassword = crypto
        .randomBytes(9)
        .toString("base64")
        .slice(0, 12);

    const passwordHash = await hashPassword(
        temporaryPassword
    );

    const employee = await Employee.create({
        empId,
        department,
        name,
        email,
        passwordHash,
        role: "employee",
        isFirstLogin: true,
        isActive: true,
    });

    // send the mail to empUser
    // await sendEmployeeCredentialsToMail({
    //     email,
    //     department: department || "NA",
    //     name,
    //     temporaryPassword,
    // });

    return {
        message: "Employee created successfully",
        employeeId: employee._id,
        department: department || "NA",
        name,
        email,
        temporaryPassword
    };
};

// empId | department | name | email
// Import employees from Excel
export const createEmployeesFromExcel = async (fileUrl) => {

    // 1. Download Excel file from Cloudinary**
    const response = await fetch(fileUrl);

    if (!response.ok) {
        throw new Error(
            "Failed to download Excel file from Cloudinary"
        );
    }

    // Convert the downloaded Excel file into a Buffer.
    // This allows XLSX to process the file directly from memory.
    const buffer = Buffer.from(
        await response.arrayBuffer()
    );

    // 2. Read and parse the Excel file**
    const workbook = XLSX.read(buffer);

    // Use the first sheet from the Excel workbook.
    const sheetName = workbook.SheetNames[0];

    if (!sheetName) {
        throw new Error(
            "Excel file does not contain a sheet"
        );
    }

    const worksheet = workbook.Sheets[sheetName];

    // Convert Excel rows into JavaScript objects.
    const employees = XLSX.utils.sheet_to_json(
        worksheet
    );

    if (employees.length === 0) {
        throw new Error("Excel file is empty");
    }



    // 3. Prepare result arrays**

    // Employees that were successfully created in MongoDB.
    const createdEmployees = [];

    // Excel rows that could not be created.
    const failedEmployees = [];


    // 4. Process each Excel row**
    for (let i = 0; i < employees.length; i++) {

        const employeeData = employees[i];

        const {
            empId,
            department,
            name,
            email,
        } = employeeData;

        // 4.1 Validate required fields*
        if (!empId || !name || !email) {

            failedEmployees.push({
                row: i + 2,
                empId: empId ?? null,
                department: department ?? null,
                name: name ?? null,
                email: email ?? null,
                reason:
                    "Employee ID, name and email are required",
            });

            // Skip this row and process the next employee.
            continue;
        }


        // 4.2 Normalize input data*
        const normalizedEmpId =
            String(empId).trim();

        const normalizedEmail =
            String(email)
                .trim()
                .toLowerCase();


        // 4.3 Check whether employee already exists*
        const existingEmployee =
            await Employee.findOne({
                $or: [
                    { empId: normalizedEmpId },
                    { email: normalizedEmail },
                ],
            });

        if (existingEmployee) {

            failedEmployees.push({
                row: i + 2,
                empId: normalizedEmpId,
                department: department ?? null,
                name: name ?? null,
                email: normalizedEmail,
                reason:
                    "Employee ID or email already exists",
            });

            // This employee already exists.
            // Do not create another account.
            continue;
        }


        // 4.4 Generate temporary password*
        const temporaryPassword =
            crypto
                .randomBytes(9)
                .toString("base64")
                .slice(0, 12);


        // 4.5 Hash temporary password*
        const passwordHash =
            await hashPassword(
                temporaryPassword
            );


        // 4.6 Create employee in MongoDB*
        try {

            const employee =
                await Employee.create({
                    empId: normalizedEmpId,
                    department,
                    name,
                    email: normalizedEmail,
                    passwordHash,
                    role: "employee",
                    isFirstLogin: true,
                    isActive: true,
                });


            // 4.7 Employee created successfully*

            // Store the employee in the successful list.
            // Email status starts as "pending" because
            // the employee exists but the credential email
            // has not been sent yet.
            createdEmployees.push({
                row: i + 2,
                employeeId: employee._id,
                empId: normalizedEmpId,
                name,
                email: normalizedEmail,
                emailStatus: "pending",
            });

            // 4.8 Send temporary credentials by email*
            try {

                await sendEmployeeCredentialsToMail({
                    email: normalizedEmail,
                    name,
                    temporaryPassword,
                });

                // Email was successfully sent.
                employee.credentialsEmailStatus = "sent";

                await employee.save();

                // Email was successfully sent.
                createdEmployees[
                    createdEmployees.length - 1
                ].emailStatus = "sent";

            } catch (emailError) {

                // Employee was already created successfully.
                // Only the email delivery failed.
                console.error(
                    `Failed to send email to ${normalizedEmail}:`
                );

                console.error(emailError);

                // Employee was created successfully,
                // but credential email delivery failed.
                employee.credentialsEmailStatus = "failed";

                await employee.save();

                // Update the API response as well.
                createdEmployees[
                    createdEmployees.length - 1
                ].emailStatus = "failed";

                createdEmployees[
                    createdEmployees.length - 1
                ].emailReason =
                    emailError.message ||
                    "Failed to send email";
            }


        } catch (error) {


            // 4.9 Handle MongoDB duplicate-key error*
            if (error.code === 11000) {

                failedEmployees.push({
                    row: i + 2,
                    empId: normalizedEmpId,
                    email: normalizedEmail,
                    reason:
                        "Employee ID or email already exists",
                });

                // Only this row fails.
                // Continue processing the remaining rows.
                continue;
            }


            // 4.10 Handle unexpected database errors*
            
            // Unexpected errors should not be silently ignored.
            // Stop the import because this may indicate a
            // database or server-level problem.
            throw error;
        }
    }

    // 5. Return import summary**
    return {
        message: "Employee import completed",

        // Total number of rows read from Excel.
        total: employees.length,

        // Number of employees successfully created in MongoDB.
        created: createdEmployees.length,

        // Number of employees that could not be created.
        failed: failedEmployees.length,

        emailFailed: createdEmployees.filter(
            employee =>
                employee.emailStatus === "failed"
        ).length,

        // Successfully created employees.
        // emailStatus tells whether credentials were sent.
        createdEmployees,

        // Employees that were not created and the reason.
        failedEmployees,
    };
};