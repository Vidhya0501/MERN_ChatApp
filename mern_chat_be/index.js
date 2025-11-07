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
const PORT = process.env.PORT || 5000;

server.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
})