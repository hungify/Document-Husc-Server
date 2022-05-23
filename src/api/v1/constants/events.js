const EVENTS = {
  CONNECTION: 'connection',
  CLIENT: {
    CREATE_ROOM: 'event://client/create-room',
    SEND_ROOM_MESSAGE: 'event://client/send-room-message',
    JOIN_ROOM: 'event://client/join-room',
    ERROR: 'event://client/error',
  },
  SERVER: {
    ROOMS: 'event://server/rooms',
    JOINED_ROOM: 'event://server/joined-room',
    ROOM_MESSAGE: 'event://server/room-message',
  },
};

module.exports = EVENTS;
