import { ChatService } from './../chat/chat.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UserService } from 'src/user/user.service';
import { MessageService } from './message.service';

@WebSocketGateway({
	namespace: "message",
	cors: {
			origin: '*',
			// methods: ['GET', 'POST'],
			credentials: true,
	},
	transports: ['websocket', 'polling'],
})
@Injectable()
export class MessageGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer() server: Server;

    constructor(
        private readonly userService: UserService,
        private readonly messageService: MessageService,
        private readonly chatService: ChatService
    ) {}

    afterInit(server: Server) {
        console.log('WebSocket initialized');
    }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('send-message')
    async handleSendMessage(
        client: Socket,
        payload: SocketPayload
    ): Promise<void> {
				console.log(payload)
        const chat = await this.chatService.findOne(payload.chatId);
        const user = await this.userService.findOneById(payload.userId);
        if (!chat) throw new NotFoundException('Chat not found');
        else if (!user) throw new NotFoundException('User not found');
        const message = await this.messageService.create(
            payload.content,
            chat,
            user
        );
        this.server.to(`chat_${payload.chatId}`).emit('message', message);
    }

    @SubscribeMessage('mark-as-read')
    async handleMarkAsRead(
        client: Socket,
        payload: { messageId: number }
    ): Promise<void> {
        await this.messageService.markAsRead(payload.messageId);
        this.server.emit('messageRead', payload.messageId);
    }

    @SubscribeMessage('get-messages')
    async handleGetMessages(
        client: Socket,
        payload: { chatId: number }
    ): Promise<void> {
				console.log(payload)
        const chat = await this.chatService.findOne(payload.chatId);
        if (!chat) throw new NotFoundException('Chat not found');
        const messages = await this.messageService.findByChat(chat);
        this.server.emit('messages', messages);
    }

    @SubscribeMessage('start-typing')
    async handleStartTyping(
        client: Socket,
        payload: { chatId: number, userId: number }
    ): Promise<void> {
        const chat = await this.chatService.findOne(payload.chatId);
        const user = await this.userService.findOneById(payload.userId);
        if (!chat) throw new NotFoundException('Chat not found');
        if (!user) throw new NotFoundException('User not found');

        if (!chat.typing.find(u => u.id === user.id)) {
            chat.typing.push(user);
            await this.chatService.save(chat);
            this.server.to(`chat_${payload.chatId}`).emit('typing', chat.typing);
        }
    }

    @SubscribeMessage('stop-typing')
    async handleStopTyping(
        client: Socket,
        payload: { chatId: number, userId: number }
    ): Promise<void> {
        const chat = await this.chatService.findOne(payload.chatId);
        const user = await this.userService.findOneById(payload.userId);
        if (!chat) throw new NotFoundException('Chat not found');
        if (!user) throw new NotFoundException('User not found');

        chat.typing = chat.typing.filter(u => u.id !== user.id);
        await this.chatService.save(chat);
        this.server.to(`chat_${payload.chatId}`).emit('typing', chat.typing);
    }
}
