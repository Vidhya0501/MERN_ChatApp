import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import {Server} from "socket.io";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors:{"origin": "*"}
})

//Map of SocketID and UserID
const onlineUsers = new Map();
//Socket authentication helper
const verifySocketToken = (token) =>{
    try {
        return jwt.verify(token, process.env.JWT_SECRET);    
    } catch (error) {
        return null;
    }
}

io.use((socket,next) => {
    const token = socket.handshake.auth.token
    const payload = verifySocketToken(token);
    if(payload){
        socket.userId = payload.id;
        next();
    }else{
        next(new Error("Authentication error"));
    }
})

io.on("connection", (socket) =>{
    console.log(`User connected: ${socket.userId}`);
    onlineUsers.set(socket.userId, socket.id);

    socket.on("join_private", ({otherUserId})=>{
         // deterministic room id
        const roomId = [socket.userId, otherUserId].sort().join("_");
        socket.join(roomId);
         // optionally, tell others in room about join
         io.to(roomId).emit("user_joined", {userId: socket.userId});
    })

    socket.on("private_message", async({to, content})=>{
        const from =socket.userId;
        const roomId = [from, to].sort().join("_");
        // Save message to DB
        const message = new Message({
            roomId,
            from,
            to,
            content,
            status: 'sent'
        });
        await message.save();
        
        // Emit to room (both sender + receiver if connected)
        io.to(roomId).emit("private_message", {
            _id: message._id,
            from,
            to,
            content,
            status: message.status,
            createdAt: message.createdAt
        })
    })
     // optional: notify specific socket if receiver is online
     const receiverSocketId = onlineUsers.get(to);
     if(receiverSocketId){
        io.to(receiverSocketId).emit("incoming_notification", {
            from,
            content: content.slice(0,60)
        });
    }
})

const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})