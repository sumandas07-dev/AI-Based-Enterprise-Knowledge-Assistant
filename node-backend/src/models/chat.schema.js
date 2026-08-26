import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "empUser",
        required: true,
    },
    title: {
        type: String,
        trim: true,
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Document",
    },
}, { timestamps: true });

const Chat = mongoose.model("chat", chatSchema);

export default Chat;