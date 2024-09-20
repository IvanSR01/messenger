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
import { NotFoundException } from '@nestjs/common'

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

	@SubscribeMessage('join-chat-id')
	handleJoinChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() { chatId }: { chatId: number }
	): void {
		const roomName = `user_chat_${chatId}`
		client.join(roomName)
		console.log(`Client ${client.id} joined room ${roomName}`)
	}

	@SubscribeMessage('leave-chat-id')
	handleLeaveChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() { chatId }: { chatId: number }
	): void {
		const roomName = `user_chat_${chatId}`
		client.leave(roomName)
		console.log(`Client ${client.id} left room ${roomName}`)
	}

	@SubscribeMessage('get-chat')
	async getChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() { chatId }: { chatId: number }
	): Promise<void> {
		try {
			const chat = await this.chatService.findOne(chatId)
			console.log(chatId)
			this.server.to(`user_chat_${chatId}`).emit('get-chat', chat)
		} catch (error) {
			console.error('Error getting chat:', error)
			client.emit('error', { message: error.message })
		}
	}
	@SubscribeMessage('start-typing')
	async startTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		{ chatId, userId }: { chatId: number; userId: number }
	): Promise<void> {
		try {
			const chat = await this.chatService.findOne(chatId)
			const user = await this.userService.findOneById(userId)

			if (!chat) throw new NotFoundException('Chat not found')
			if (!user) throw new NotFoundException('User not found')
			console.log(chatId)
			if (!chat.typing.find(u => u.id === user.id)) {
				chat.typing.push(user)
				await this.chatService.save(chat)
				await this.getChat(client, { chatId })
			}
		} catch (error) {
			console.error('Error handling start typing:', error)
			client.emit('error', { message: error.message })
		}
	}

	@SubscribeMessage('stop-typing')
	async stopTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		{ chatId, userId }: { chatId: number; userId: number }
	): Promise<void> {
		try {
			const chat = await this.chatService.findOne(chatId)
			const user = await this.userService.findOneById(userId)

			if (!chat) throw new NotFoundException('Chat not found')
			if (!user) throw new NotFoundException('User not found')

			chat.typing = chat.typing.filter(u => u.id !== user.id)
			await this.chatService.save(chat)

			await this.getChat(client, { chatId })
		} catch (error) {
			console.error('Error handling stop typing:', error)
			client.emit('error', { message: error.message })
		}
	}
}
