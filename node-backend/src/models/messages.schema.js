import mongoose, { Schema } from "mongoose";

const msgSchema = new Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chat",
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    sources: {
        type: Array,
        default: [],
    },
}, { timestamps: true });

const Message = mongoose.model("message", msgSchema);

export default Message;