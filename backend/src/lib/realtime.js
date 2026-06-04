import { Server } from 'socket.io';

let io = null;

export function initRealtime(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    socket.on('subscribe', (channels = []) => {
      const list = Array.isArray(channels) ? channels : [channels];
      list.forEach((channel) => {
        if (typeof channel === 'string' && channel.trim()) {
          socket.join(channel);
        }
      });
    });
  });

  return io;
}

export function emitRealtime(channel, event, payload) {
  if (!io) return;
  io.to(channel).emit(event, payload);
  io.emit(event, payload);
}
