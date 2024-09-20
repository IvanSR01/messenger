import { Injectable, NotFoundException } from '@nestjs/common'
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
import { MessageService } from './message.service'

@WebSocketGateway({
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true
	},
	transports: ['websocket', 'polling']
})
export class MessageGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server

	constructor(
		private readonly userService: UserService,
		private readonly messageService: MessageService,
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

	@SubscribeMessage('join-room')

	handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() { userId }: { userId: number }
	): void {
		const roomName = `user_${userId}`
		client.join(roomName)
		console.log(`Client ${client.id} joined room ${roomName}`)
	}

	@SubscribeMessage('leave-room')
	handleLeaveRoom(
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

	@SubscribeMessage('join-chat')
	handleJoinChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() { chatId }: { chatId: number }
	): void {
		const roomName = `chat_${chatId}`
		client.join(roomName)
		// console.log(`Client ${client.id} joined room ${roomName}`)
	}

	@SubscribeMessage('leave-chat')
	handleLeaveChat(
		@ConnectedSocket() client: Socket,
		@MessageBody() { chatId }: { chatId: number }
	): void {
		const roomName = `chat_${chatId}`
		client.leave(roomName)
		// console.log(`Client ${client.id} left room ${roomName}`)
	}

	@SubscribeMessage('get-messages')
	async getMessages(
		@ConnectedSocket() client: Socket,
		@MessageBody() { chatId }: { chatId: number }
	): Promise<void> {
		try {
			const messages = await this.messageService.getMessage(chatId)
			this.server.to(`chat_${chatId}`).emit('get-messages', messages)
		} catch (error) {
			console.error('Error getting messages:', error)
			client.emit('error', { message: error.message })
		}
	}

	@SubscribeMessage('send-message')
	async sendMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		{
			chatId,
			userId,
			content
		}: { chatId: number; userId: number; content: string }
	): Promise<void> {
		try {
			const chat = await this.chatService.findOne(chatId)
			const user = await this.userService.findOneById(userId)

			if (!chat) {
				throw new NotFoundException('Chat not found')
			} else if (!user) {
				throw new NotFoundException('User not found')
			}

			await this.messageService.create(content, chat, user)

			this.server.to(`chat_${chatId}`).emit('new-message', {
				chatId,
				userId,
				content
			})
			await chat.users.forEach(async user => {
				await this.getChats(client, { userId: user.id })
			})
			await this.getMessages(client, { chatId })
		} catch (error) {
			console.error('Error sending message:', error)
			client.emit('error', { message: error.message })
		}
	}


	@SubscribeMessage('update-message')
	async updateMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		{
			messageId,
			content,
			chatId,
			userId
		}: { messageId: number; content: string; chatId: number; userId: number }
	): Promise<void> {
		try {
			await this.messageService.update(messageId, content)
			await this.getMessages(client, { chatId })
		} catch (error) {
			console.error('Error updating message:', error)
			client.emit('error', { message: error.message })
		}
	}

	@SubscribeMessage('mark-as-read')
	async markAsRead(
		@ConnectedSocket() client: Socket,
		@MessageBody()
		{
			messageId,
			chatId,
			isRefresh,
			userId
		}: { messageId: number; chatId: number; isRefresh: boolean; userId: number }
	): Promise<void> {
		try {
			await this.messageService.markAsRead(messageId)
			if (isRefresh) {
				await this.getMessages(client, { chatId })
			} else {
				client.emit('mark-as-read', 'success')
			}
		} catch (error) {
			console.error('Error marking message as read:', error)
			client.emit('error', { message: error.message })
		}
	}

	
}
