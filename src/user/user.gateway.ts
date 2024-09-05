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

		if (data.status === 'online') {
			await this.userService.updateUser(user.id, {
				status: {
					isOnline: true,
					lastSeen: new Date()
				}
			})
		} else if (data.status === 'offline') {
			await this.userService.updateUser(user.id, {
				status: {
					isOnline: false,
					lastSeen: new Date()
				}
			})
		}
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
