import { Server } from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';

const onlineUsers = new Set();

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: '*', // 在生產環境建議限制為你的前端網址
            methods: ['GET', 'POST'],
        },
    });

    const JWT_SECRET = process.env.JWT_SECRET || '1213ijfodsfjlxfzj';

    io.use((socket, next) => {
        const token = socket.handshake.auth?.headers?.Authorization || socket.handshake.auth?.token;
        if (!token) {
            return next(new Error('Missing token'));
        }

        let tokenToVerify = token;
        if (token.startsWith('Bearer ')) {
            tokenToVerify = token.slice(7);
        }

        try {
            const decodedToken = jsonwebtoken.verify(tokenToVerify, JWT_SECRET);
            socket.userId = decodedToken.id;
            socket.username = decodedToken.username;
            return next();
        } catch (ex) {
            console.log('Socket Auth Error:', ex.message);
            return next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.userId}`);
        onlineUsers.add(socket.userId);

        io.emit('user_connected', socket.userId);

        socket.on('addRoom', (roomName) => {
            socket.join(roomName);
            console.log(`User ${socket.userId} joined room: ${roomName}`);
        });

        socket.on('send_message', ({ roomName, message }) => {
            io.to(roomName).emit('send_message', message);
        });

        socket.on('send_image', ({ roomName, messageData }) => {
            io.to(roomName).emit('send_image', messageData);
        });

        socket.on('typing', ({ isTyping }) => {
            socket.broadcast.emit('typing', { isTyping });
        });

        socket.on('get_online', ({ isOnline }) => {
            if (isOnline) {
                socket.broadcast.emit('user_connected', socket.userId);
            } else {
                socket.broadcast.emit('user_disconnected', socket.userId);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.userId}`);
            onlineUsers.delete(socket.userId);
            io.emit('user_disconnected', socket.userId);
        });
    });

    return io;
};
