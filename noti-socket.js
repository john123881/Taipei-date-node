import { Server } from 'socket.io';
import express from 'express';
import db from './utils/mysql2-connect.js';
import authenticate from './middlewares/authenticate.js';
import cors from 'cors';

const io = new Server({
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

const router = express.Router();

let onlineUsers = [];

const addNewUser = (username, socketId) => {
    !onlineUsers.some((user) => user.username === username) &&
        onlineUsers.push({ username, socketId });
};

const removeUser = (socketId) => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (username) => {
    return onlineUsers.find((user) => user.username === username);
};

// Get Notification router is in routes/home

io.on('connection', (socket) => {
    console.log('someone has connected!');

    socket.on('newUser', (username) => {
        addNewUser(username, socket.id);
        console.log(`Added new user: ${username}`);
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

        // 將通知存儲到數據庫
        try {
            const query = `
                    INSERT INTO 
                        comm_noti (sender_id, receiver_id, type, message, post_id, is_read)
                    VALUES (?, ?, ?, ?, ?, 0)
                `;
            const [results] = await db.query(query, [
                senderId,
                receiverId,
                type,
                message,
                postId,
            ]);

            const notiId = results.insertId;

            // console.log(notiId);

            console.log('Notification saved to database');

            // 向發送者回應通知已成功保存
            socket.emit('notificationSaved', {
                status: true,
                message: '通知新增成功',
            });

            const receiver = getUser(receiverName);

            if (receiver) {
                // 向接收者的socket發送通知
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
                console.log(
                    `Notification sent from ${senderName} to ${receiverName}: ${type}`
                );
            } else {
                console.log(`Receiver ${receiverName} not found.`);
            }
        } catch (error) {
            console.error('Failed to save notification:', error);

            // 向發送者回應通知保存失敗
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
            const query = `
                DELETE FROM
                    comm_noti
                WHERE
                    sender_id = ? AND receiver_id = ? AND post_id = ? AND type = ?
            `;
            const [results] = await db.query(query, [
                senderId,
                receiverId,
                postId,
                type,
            ]);

            console.log('Notification removed from database');

            socket.emit('notificationRemoved', {
                status: true,
                message: '通知已移除',
            });
        } catch (error) {
            console.error('Failed to remove notification:', error);

            socket.emit('notificationError', {
                status: false,
                message: '移除通知失敗',
                error: error.message,
            });
        }
    });

    socket.on('removeFollowNotification', async (data) => {
        const { senderId, receiverId, type } = data;

        try {
            const query = `
                DELETE FROM
                    comm_noti
                WHERE
                    sender_id = ? AND receiver_id = ? AND type = ?
            `;
            const [results] = await db.query(query, [
                senderId,
                receiverId,
                type,
            ]);

            console.log('Notification removed from database');

            socket.emit('notificationRemoved', {
                status: true,
                message: '通知已移除',
            });
        } catch (error) {
            console.error('Failed to remove notification:', error);

            socket.emit('notificationError', {
                status: false,
                message: '移除通知失敗',
                error: error.message,
            });
        }
    });

    socket.on('disconnect', () => {
        console.log('someone has left');
        removeUser(socket.id);
    });
});

io.listen(3008);
