import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jsonwebtoken from 'jsonwebtoken';

// 建立 Express 應用程式
const app = express();
// 使用 CORS 中間件
app.use(cors());

// 建立 HTTP 伺服器並將 Express 應用程式傳遞給它
const server = http.createServer(app);

// 建立 Socket.IO 伺服器並設置 CORS 選項 (前端)
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});
process.env.JWT_SECRET = '1213ijfodsfjlxfzj';

// 驗證 token，檢查授權 (authenticate)
io.use((socket, next) => {
    const token = socket.handshake.auth.headers.Authorization;
    console.log('Token:', token);
    if (!token) {
        return next(new Error('Missing token'));
    }

    if (typeof token === 'string' && token.startsWith('Bearer ')) {
        const token2 = token.slice(7);
        console.log('Token 2:', token2);

        try {
            const decodedToken = jsonwebtoken.verify(
                token2,
                process.env.JWT_SECRET
            );
            console.log('Decoded token:', decodedToken);
            // 解析 token 並將用戶訊息加到 socket 中
            socket.userId = decodedToken.id;
            socket.username = decodedToken.username;
            return next();
        } catch (ex) {
            console.log({ ex });
            return next(new Error('Invalid token'));
        }
    }

    return next(new Error('Invalid token'));
});

// 在線用戶列表
const onlineUsers = new Set();
console.log(onlineUsers);

io.on('connection', (socket) => {
    console.log(`a user connected ${socket.userId}`);

    // 用戶連接時，將其ID加入在線用戶列表
    onlineUsers.add(socket.userId);
    console.log(`Current online users: ${Array.from(onlineUsers)}`); // 紀錄在線用戶列表

    // 向所有客戶廣播有新用戶連接
    io.emit('user_connected', socket.userId);

    // 監聽客戶端發送的 'addRoom' 事件
    socket.on('addRoom', (roomName) => {
        socket.join(roomName); // 將客戶端添加到指定的房間
        console.log(`Client ${socket.userId} joined room: ${roomName}`);
    });

    // 監聽客戶端發送的 'send_message' 事件
    socket.on('send_message', ({ roomName, message }) => {
        console.log(
            `Get message from room name '${roomName}' msg = ${message.content}`
        );
        console.log(message);
        io.to(roomName).emit('send_message', message);
    });

    socket.on('send_image', ({ roomName, messageData }) => {
        console.log(
            `Received image message from ${socket.userId} and Room is ${roomName}`
        );
        console.log(messageData);
        console.log(`Content type: ${messageData.content}`);

        // // 打印 Base64 字符串的開頭和結尾，避免打印過多內容
        // const preview = `${messageData.imageBase64.substring(
        //     0,
        //     30
        // )}...${messageData.imageBase64.substring(
        //     messageData.imageBase64.length - 30
        // )}`;
        // console.log(`Image data preview: ${preview}`);
        io.to(roomName).emit('send_image', messageData);
    });

    socket.on('typing', ({ isTyping }) => {
        socket.broadcast.emit('typing', { isTyping });
    });

    // 監聽 'get_online' 事件
    socket.on('get_online', ({ isOnline }) => {
        if (isOnline) {
            socket.broadcast.emit('user_connected', socket.userId);
        } else {
            socket.broadcast.emit('user_disconnected', socket.userId);
        }
    });

    // 在客戶端斷開連接時，執行清理邏輯
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
        onlineUsers.delete(socket.userId);
        io.emit('user_disconnected', socket.userId);
    });
});

// Socket.IO server port
const PORT = 3003;
server.listen(PORT, () => {
    console.log(`Socket server is running at http://localhost:${PORT}`);
});
