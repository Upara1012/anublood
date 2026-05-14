let io;

const socketService = (ioInstance) => {
  io = ioInstance;

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
};

const sendNotification = (userId, notification) => {
  if (io) {
    io.to(userId).emit('notification', notification);
  }
};

const broadcastUpdate = (type, data) => {
  if (io) {
    io.emit('update', { type, data });
  }
};

module.exports = socketService;
module.exports.sendNotification = sendNotification;
module.exports.broadcastUpdate = broadcastUpdate;
