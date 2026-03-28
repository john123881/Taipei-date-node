import { Server } from 'socket.io';
import jsonwebtoken from 'jsonwebtoken';
import prisma from './prisma-client.js';
import cookie from 'cookie';
import { isOriginAllowed } from './cors-config.js';

let onlineUsers = []; // [{ username, userId, socketId }]

export const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (isOriginAllowed(origin)) {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST'],
            credentials: true,
        },
    });

    const JWT_SECRET = process.env.JWT_SECRET;

    const addNewUser = (username, userId, socketId) => {
        const index = onlineUsers.findIndex((user) => user.userId === userId);
        if (index !== -1) {
            onlineUsers[index].socketId = socketId;
            onlineUsers[index].username = username;
        } else {
            onlineUsers.push({ username, userId, socketId });
        }
    };

    const removeUser = (socketId) => {
        onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
    };

    const getUserByUsername = (username) => {
        return onlineUsers.find((user) => user.username === username);
    };

    io.use((socket, next) => {
        // 從 Cookie 讀取
        const cookies = cookie.parse(socket.handshake.headers.cookie || '');
        let token = cookies.token;

        // 向下相容
        if (!token) {
            token = socket.handshake.auth?.headers?.Authorization || socket.handshake.auth?.token;
        }

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
        console.log(`Socket connected: ${socket.userId} (${socket.username})`);
        
        // 註冊用戶到在線列表 (包含 username 以利通知尋送)
        addNewUser(socket.username, socket.userId, socket.id);

        io.emit('user_connected', socket.userId);

        // --- 聊天模組 (Chat) ---
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

        // --- 通知模組 (Notification) ---
        socket.on('newUser', (username) => {
            // 前端有些地方會發送 newUser，確保更新對應關係
            addNewUser(username, socket.userId, socket.id);
        });

        socket.on('sendNotification', async (data) => {
            const {
                senderId,
                senderName,
                receiverId,
                receiverName,
                type,
                postId,
                message,
                avatar,
            } = data;

            try {
                // 將通知存入資料庫 (使用 Prisma)
                const newNoti = await prisma.comm_noti.create({
                    data: {
                        sender_id: senderId,
                        receiver_id: receiverId,
                        type: type,
                        message: message,
                        post_id: postId || null,
                        is_read: false,
                    }
                });

                const notiId = newNoti.comm_noti_id;

                // 回應發送者
                socket.emit('notificationSaved', {
                    status: true,
                    message: '通知新增成功',
                });

                // 嘗試即時推播給接收者
                const receiver = getUserByUsername(receiverName);
                if (receiver) {
                    io.to(receiver.socketId).emit('getNotification', {
                        notiId,
                        senderName,
                        senderId,
                        receiverId,
                        receiverName,
                        type,
                        postId,
                        message,
                        avatar,
                    });
                }
            } catch (error) {
                console.error('Failed to save notification:', error);
                socket.emit('notificationError', {
                    status: false,
                    message: '通知新增失敗',
                    error: error.message,
                });
            }
        });

        socket.on('removeNotification', async (data) => {
            const { senderId, receiverId, postId, type } = data;
            try {
                // 使用 Prisma 刪除通知
                await prisma.comm_noti.deleteMany({
                    where: {
                        sender_id: senderId,
                        receiver_id: receiverId,
                        post_id: postId,
                        type: type,
                    }
                });
                socket.emit('notificationRemoved', { status: true, message: '通知已移除' });
            } catch (error) {
                console.error('Failed to remove notification:', error);
            }
        });

        socket.on('removeFollowNotification', async (data) => {
            const { senderId, receiverId, type } = data;
            try {
                // 使用 Prisma 刪除追蹤通知
                await prisma.comm_noti.deleteMany({
                    where: {
                        sender_id: senderId,
                        receiver_id: receiverId,
                        type: type,
                    }
                });
                socket.emit('notificationRemoved', { status: true, message: '通知已移除' });
            } catch (error) {
                console.error('Failed to remove follow notification:', error);
            }
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
            removeUser(socket.id);
            io.emit('user_disconnected', socket.userId);
        });
    });

    return io;
};
