import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions, Server } from 'socket.io';
import { INestApplication } from '@nestjs/common';

export class CustomIoAdapter extends IoAdapter {
  constructor(private app: INestApplication) {
    super(app);
  }

  createIOServer(port: number, options?: ServerOptions): Server {
    const server = super.createIOServer(port, options);
    // Добавьте вашу логику конфигурации, если необходимо
    // server.on('connection', (socket) => {
    //   console.log(`Client connected: ${socket.id}`);
		// 	server.emit('hi', { data: 'Hello from server' })
    //   socket.on('disconnect', () => {
    //     console.log(`Client disconnected: ${socket.id}`);
    //   });
    // });

    return server;
  }
}
