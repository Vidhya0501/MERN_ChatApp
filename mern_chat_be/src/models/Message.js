import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    roomId: String,
    from:{ type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    to:{ type:mongoose.SchemaTypes.ObjectId, ref: 'User'},
    content: String,
    status:{type:String, enum:[ 'sent', 'delivered', 'read'], default:'sent'},
    createdAt: { type: Date, default: Date.now }
})

export default mongoose.model("Message", messageSchema)