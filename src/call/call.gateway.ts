import { MessageGateway } from './../message/message.gateway'
import {
	WebSocketGateway,
	SubscribeMessage,
	OnGatewayInit,
	OnGatewayConnection,
	OnGatewayDisconnect,
	WebSocketServer
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { CallService } from './call.service'
import { CallStatus } from './call.entity'
import { CreateCallDto } from './dto/call.dto'

@WebSocketGateway({
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true
	},
	transports: ['websocket', 'polling']
})
export class CallGateway
	implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
	@WebSocketServer() server: Server

	constructor(
		private readonly callService: CallService,
		private readonly messageGateway: MessageGateway
	) {}

	afterInit(server: Server) {
		console.log('WebSocket server initialized')
	}

	handleConnection(client: Socket) {
		console.log(`Client connected: ${client.id}`)
	}

	handleDisconnect(client: Socket) {
		console.log(`Client disconnected: ${client.id}`)
	}

	@SubscribeMessage('create-call')
	async handleCreateCall(client: Socket, dto: CreateCallDto) {
		const call = await this.callService.createCall(dto)
		client.join(call.id.toString())

		this.messageGateway.sendMessage(client, {
			chatId: dto.chatId,
			userId: dto.fromUserId,
			content:
				'$extra_create_content-button$'
		})
		client.emit('create-call', call)
		for (let i = 0; i < call.participants.length; i++) {
			this.handleRequestCalls(client, { userId: call.participants[i].id })
		}
	}

	@SubscribeMessage('get-call')
	async handleGetCall(client: Socket, callId: number) {
		const call = await this.callService.findById(callId)
		this.server.emit('get-call', call)
	}

	@SubscribeMessage('join-call')
	async handleJoinCall(client: Socket, { userId, callId }) {
		const call = await this.callService.joinCall(userId, callId)
		client.join(callId.toString())
		console.log(call)
		this.handleUpdateCallSignal(client, {
			userId,
			callId,
			signal: []
		})
	}

	@SubscribeMessage('leave-call')
	async handleLeaveCall(client: Socket, { userId, callId }) {
		const { isAllRejected, call } = await this.callService.leaveCall(
			userId,
			callId
		)
		this.handleGetCall(client, callId)
	}

	@SubscribeMessage('close-call')
	async handleCloseCall(client: Socket, { userId, callId }) {
		const call = await this.callService.closeCall(callId, userId)
		this.handleGetCall(client, callId)
	}

	@SubscribeMessage('reject-call')
	async handleRejectCall(client: Socket, { userId, callId }) {
		const call = await this.callService.rejectCall(callId, userId)
		this.handleGetCall(client, callId)
	}

	@SubscribeMessage('call-status')
	async handleUpdateCallStatus(client: Socket, { userId, callId, status }) {
		const participant = await this.callService.updateCallStatus(
			callId,
			userId,
			status
		)
		this.server.to(callId.toString()).emit('call-status', participant)
	}

	@SubscribeMessage('call-signal')
	async handleUpdateCallSignal(client: Socket, { userId, callId, signal }) {
		const participant = await this.callService.updateCallSignal(
			callId,
			userId,
			signal
		)
		console.log(signal)
		
		await this.handleGetCall(client, callId)
		await this.handleRequestCalls(client, { userId })
		this.server.to(callId.toString()).emit('call-signal', participant)
	}
	@SubscribeMessage('request-calls')
	async handleRequestCalls(client: Socket, { userId }: { userId: number }) {
		const calls = await this.callService.getRequestedCallsForUser(userId)
		this.server.emit(`request-calls-${userId}`, calls)
	}
}
