const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const EVENTS = require('../constants/events');
const { jwt } = require('../../../configs/env.config');
const JWT = require('jsonwebtoken');
const createError = require('http-errors');

const conversations = new Set();

const initSocket = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.headers?.authorization;
      if (token) {
        const secret = jwt.accessTokenSecret;
        const payload = await JWT.verify(token, secret);
        if (payload) {
          return next();
        }
      } else {
        next(createError.Unauthorized('Token is missing'));
      }
    } catch (error) {
      next(createError.Unauthorized());
    }
  });

  io.on(EVENTS.CONNECTION, (socket) => {
    socket.emit(EVENTS.SERVER.ROOMS, Array.from(conversations));

    socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ conversationId }) => {
      if (!conversations.has(conversationId)) {
        conversations.add(conversationId);
      }
      socket.join(conversationId);
      socket.emit(EVENTS.SERVER.JOINED_ROOM, conversationId);
    });

    socket.on(
      EVENTS.CLIENT.SEND_ROOM_MESSAGE,
      async (
        { conversationId, content, username, senderId, avatar },
        callback
      ) => {
        const foundConversation = await Conversation.findOne({
          _id: conversationId,
        });

        if (foundConversation) {
          const newMessage = new Message({
            content,
            sender: senderId,
          });
          await newMessage.save();

          const updateConversation = await Conversation.updateOne(
            { _id: conversationId },
            {
              $push: {
                messages: [newMessage._id],
              },
              $addToSet: {
                members: [senderId],
              },
            }
          );
          if (updateConversation.modifiedCount > 0) {
            socket.to(conversationId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
              content,
              username,
              avatar,
              senderId,
              createdAt: newMessage.createdAt,
            });
            callback({
              status: 'ok',
            });
          }
        }
      }
    );

    socket.on(EVENTS.CLIENT.JOIN_ROOM, (roomId) => {
      socket.join(roomId);

      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
    });
  });
};

module.exports = initSocket;
