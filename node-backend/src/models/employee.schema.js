import mongoose, { Schema } from "mongoose";

const empSchema = new Schema({
    empId: {
        type: String,
        required: true,
        unique: true,
    },
    department: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["employee"],
        default: "employee",
    },
    isFirstLogin: {
        type: Boolean,
        default: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    credentialsEmailStatus: {
        type: String,
        enum: ["pending", "sent", "failed"],
        default: "pending"
    },
}, { timestamps: true})

const Employee = mongoose.model("employee", empSchema);
export default Employee;