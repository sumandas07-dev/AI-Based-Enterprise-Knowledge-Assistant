import mongoose, { Schema } from "mongoose";

const docSchema = new Schema({
    filename: {
        type: String,
        required: true,
        trim: true,
    },
    cloudinaryUrl: {
        type: String,
        required: true,
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "AdminUser",
        required: true,
    },
    status: {
        type: String,
        enum: ["processing", "completed", "failed"],
        default: "processing",
    },
}, { timestamps: true });

const Document = mongoose.model("document", docSchema);

export default Document;