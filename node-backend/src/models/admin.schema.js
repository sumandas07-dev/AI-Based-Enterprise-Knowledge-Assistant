import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema({
    company_name: {
        type: String,
        trim: true,
    },
    name: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, { timestamps: true });

const Admin = mongoose.model("admin", adminSchema);
export default Admin;