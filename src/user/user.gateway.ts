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

@WebSocketGateway({
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true
	},
	transports: ['websocket', 'polling']
})
export class UserGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server

	constructor(private readonly userService: UserService) {}

	afterInit(): void {
		console.log('WebSocket initialized')
	}

	handleConnection(client: Socket): void {
		console.log(`Client connected: ${client.id}`)
	}

	handleDisconnect(client: Socket): void {
		console.log(`Client disconnected: ${client.id}`)
	}

	@SubscribeMessage('toggle-status')
	async toggleStatus(
		@MessageBody() data: { userId: number; status: 'online' | 'offline' },
		@ConnectedSocket() client: Socket
	): Promise<void> {
		const user = await this.userService.findOneById(data.userId)

		if (!user) throw new NotFoundException('User not found')

		console.log(data)

		if (data.status === 'offline') {
			// Когда пользователь оффлайн, ставим isOnline: false и обновляем lastSeen
			await this.userService.updateUser(user.id, {
				status: {
					isOnline: true, // Исправлено на false
					lastSeen: new Date() // Обновляем lastSeen при выходе пользователя
				}
			})
		} else if (data.status === 'online') {
			// Когда пользователь онлайн, ставим isOnline: true, lastSeen можно не обновлять
			await this.userService.updateUser(user.id, {
				status: {
					isOnline: false, // Исправлено на true
					lastSeen: new Date()
				}
			})
		}
		await this.getUserStatus({ userId: user.id }, client)
	}
	@SubscribeMessage('user-status')
	async getUserStatus(
		@MessageBody() data: { userId: number },
		@ConnectedSocket() client: Socket
	): Promise<void> {
		const user = await this.userService.findOneById(data.userId)

		if (!user) throw new NotFoundException('User not found')

		this.server.emit('user-status', user.status)
	}
}
