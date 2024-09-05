

import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	OnGatewayInit,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { UserService } from 'src/user/user.service'
import { ChatService } from './../chat/chat.service'

@WebSocketGateway({
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true
	},
	transports: ['websocket', 'polling']
})
export class ChatGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server

	constructor(
		private readonly userService: UserService,
		private readonly chatService: ChatService
	) {}

	afterInit(): void {
		console.log('WebSocket initialized')
	}

	handleConnection(client: Socket): void {
		// console.log(`Client connected: ${client.id}`)
	}

	handleDisconnect(client: Socket): void {
		// console.log(`Client disconnected: ${client.id}`)
	}

	@SubscribeMessage('join-chat')
	handleJoinChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId }: { userId: number }
	): void {
		const roomName = `user_${userId}`
		client.join(roomName)
		console.log(`Client ${client.id} joined room ${roomName}`)
	}

	@SubscribeMessage('leave-chat')
	handleLeaveChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId }: { userId: number }
	): void {
		const roomName = `user_${userId}`
		client.leave(roomName)
		console.log(`Client ${client.id} left room ${roomName}`)
	}

	@SubscribeMessage('get-chats')
	async getChats(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId }: { userId: number }
	): Promise<void> {
		try {
			const chats = await this.chatService.findAll(userId)

			this.server.to(`user_${userId}`).emit('get-chats', chats)
		} catch (error) {
			console.error('Error getting chats:', error)
			this.server.emit('error', { message: error.message })
		}
	}
}