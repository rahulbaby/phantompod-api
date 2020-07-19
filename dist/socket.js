"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _chat = _interopRequireDefault(require("./api/controllers/chat"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const socketio = require('socket.io');

var _default = server => {
  const io = socketio(server); // Setup Socket.io's server

  io.on('connection', socket => {
    console.log('connection established');
    socket.on('join', async roomId => {
      socket.join(roomId);
      io.emit('roomJoined', roomId);
      console.log('roomJoined', roomId);
    });
    socket.on('message', async data => {
      console.log('message', data);
      const {
        author,
        message,
        roomId
      } = data;
      data.createdAt = new Date();
      io.sockets.in(roomId).emit('newMessage', data);
    });
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
  });
};

exports.default = _default;