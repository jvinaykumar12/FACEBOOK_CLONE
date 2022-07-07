import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv"
import morgan from "morgan";
import helmet from "helmet"; 
import userRouter from "./routes/userRouter.js";
import authRouter from "./routes/authenticationRouter.js";
import postRouter from "./routes/postsRouter.js"
import cors from "cors"
import multer from "multer";
import path from 'path'
import messageRouter from "./routes/messageRouter.js";
import conversationRouter from "./routes/conversationRouter.js";
import {Server} from "socket.io";
import http from "http"

const app = express()
const server = http.createServer(app)
app.use(cors())
app.use(express.json())
app.use(helmet())
app.use(morgan("common"))
dotenv.config()
app.use("/auth",authRouter)
app.use("/users",userRouter)
app.use("/post",postRouter)
app.use("/message",messageRouter)
app.use("/conversation",conversationRouter)
mongoose.connect(process.env.MONGODB,()=>{});


const io = new Server(server,{
    cors:{
        origin:'*'
    }                                                               //handles socket,.io
})
let currentUsers = []
const addUser = (userId,socketId)=>{
    !currentUsers.some(element => element.userId === userId) &&
    currentUsers.push({userId,socketId})
}
const disconnectUser = (userId)=>{
    currentUsers = currentUsers.filter(element=>element.userId!==userId)
}

io.on("connection", socket=>{
    socket.emit("hello","socket is working")
    socket.on("adduser",arg=>{
        addUser(arg.userId,arg.socketId)
        socket.emit('online',currentUsers)
    })
    socket.on('disconnectUser',arg=>{
        disconnectUser(arg.userId)
        socket.emit('online',currentUsers)
    })
    socket.on('message',arg=>{
        const user = currentUsers.find(e=>e.userId === arg.userId )
        user && socket.to(user.socketId).emit('receiveMessage',{message:arg.messageText,senderId:arg.senderId,messageId:arg.messageId})        
    })
})




const storage = multer.diskStorage({
    destination: (req,file,cb)=>{                                           //save images
        cb(null,"public/images")
    },
    filename: (req,file,cb) => {
        cb(null,req.body.name)
    }
})
const upload = multer({storage})
const name = path.resolve()                                                                             
app.use('/images',express.static(path.join(name,'/public/images')))
app.post("/image/upload",upload.single('file'),(req,res)=>{
    try {
        return res.status(200).json("uploaded")
    }
    catch(e) {
        return res.status(400).json(e)
    }
})




server.listen(3001)