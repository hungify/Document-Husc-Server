const Conversation = require('../models/conversation.model');
const Message = require('../models/message.model');
const EVENTS = require('../constants/events');

const rooms = new Set();

function initSocket(io) {
  io.on(EVENTS.connection, (socket) => {
    socket.emit(EVENTS.SERVER.ROOMS, Array.from(rooms));

    socket.on(EVENTS.CLIENT.CREATE_ROOM, ({ roomId }) => {
      if (!rooms.has(roomId)) {
        rooms.add(roomId);
      }

      socket.join(roomId);

      socket.emit(EVENTS.SERVER.JOINED_ROOM, roomId);
    });

    socket.on(
      EVENTS.CLIENT.SEND_ROOM_MESSAGE,
      async ({ roomId, message, username, sender }) => {
        const foundConversation = await Conversation.findOne({
          _id: roomId,
        });

        if (foundConversation) {
          const newMessage = new Message({
            content: message,
            sender,
          });
          await newMessage.save();

          const updateConversation = await Conversation.updateOne(
            { _id: roomId },
            {
              $push: {
                messages: [newMessage._id],
              },
              $addToSet: {
                members: [sender],
              },
            }
          );
          if (updateConversation.modifiedCount > 0) {
            const date = new Date();
            socket.to(roomId).emit(EVENTS.SERVER.ROOM_MESSAGE, {
              message,
              username,
              time: `${date.getHours()}:${date.getMinutes()}`,
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
}

module.exports = initSocket;
