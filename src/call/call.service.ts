import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Call, CallStatus } from './call.entity'
import { Repository } from 'typeorm'
import { UserService } from 'src/user/user.service'
import { CreateCallDto } from './dto/call.dto'

@Injectable()
export class CallService {
	constructor(
		@InjectRepository(Call) private readonly callRepository: Repository<Call>,
		private readonly userService: UserService
	) {}

	// Найти звонок по ID
	async findById(id: number) {
		const call = await this.callRepository.findOne({
			where: { id }
		})
		if (!call) throw new NotFoundException('Call not found')
		return call
	}

	// Создание нового звонка
	async createCall(dto: CreateCallDto) {
		const fromUser = await this.userService.findOneById(dto.fromUserId)
		if (!fromUser) throw new NotFoundException('User not found')

		const participants = []
		for (const userId of dto.toUserId) {
			const user = await this.userService.findOneById(userId)
			if (!user) throw new NotFoundException(`User ${userId} not found`)

			const callUser = {
				action: {
					isVideoActive: dto.callType === 'video',
					isAudioActive: dto.callType === 'audio'
				},
				callStatus:
					fromUser.id === userId ? CallStatus.ACTIVE : CallStatus.REQUESTED,
				signals: [] as any[],
				id: user.id,
				username: user.username,
				fullName: user.fullName
			}

			participants.push(callUser)
		}
		// Создаем звонок
		const call = this.callRepository.create({
			from: fromUser,
			to: participants.filter(item => item.id !== fromUser.id),
			participants: participants,
			name: dto.name || '',
			callType: dto.callType,
			isGroup: dto.isGroup || false,
			status: CallStatus.ACTIVE,
			chatId: dto.chatId
		})
		return await this.callRepository.save(call)
	}

	// Присоединение к звонку
	async joinCall(userId: number, callId: number) {
		const call = await this.callRepository.findOne({
			where: { id: callId }
		})
		if (!call) throw new NotFoundException('Call not found')
		const user = await this.userService.findOneById(userId)
		if (!user) throw new NotFoundException('User not found')

		// Проверка на существование участника
		const existingParticipant = call.participants.find(
			participant => participant.id === userId
		)
		if (existingParticipant.callStatus === CallStatus.ACTIVE)
			throw new NotFoundException('User already in call')
		call.participants = call.participants.filter(item => item.id !== userId)
		// Добавляем нового участника
		const newParticipant = {
			action: {
				isVideoActive: false,
				isAudioActive: false
			},
			callStatus: CallStatus.ACTIVE,
			signals: [] as any[],
			id: user.id,
			username: user.username,
			fullName: user.fullName
		}

		call.participants.push(newParticipant)
		return await this.callRepository.save(call)
	}

	// Покинуть звонок
	async leaveCall(userId: number, callId: number) {
		const call = await this.callRepository.findOne({
			where: { id: callId }
		})
		if (!call) throw new NotFoundException('Call not found')

		const user = await this.userService.findOneById(userId)
		if (!user) throw new NotFoundException('User not found')

		let isAllRejected = !call.isGroup

		if (!call.isGroup) {
			// Обновляем статус всех участников на REJECTED
			call.participants = call.participants.map(participant => ({
				...participant,
				callStatus: CallStatus.REJECTED
			}))
			call.status = CallStatus.ENDED
			call.endTime = new Date().toISOString()
		} else {
			// Убираем участника из списка
			call.participants = call.participants.filter(
				participant => participant.id !== userId
			)

			const updatedParticipant = {
				action: {
					isVideoActive: false,
					isAudioActive: false
				},
				callStatus: CallStatus.REJECTED,
				signals: [] as any[],
				id: user.id,
				username: user.username,
				fullName: user.fullName
			}

			call.participants.push(updatedParticipant)

			const allRejected = call.participants.every(
				participant => participant.callStatus === CallStatus.REJECTED
			)

			if (allRejected) {
				call.status = CallStatus.ENDED
				call.endTime = new Date().toISOString()
				isAllRejected = true
			}
		}

		return { isAllRejected, call: await this.callRepository.save(call) }
	}

	// Закрыть звонок
	async closeCall(callId: number, userId: number) {
		const call = await this.callRepository.findOne({
			where: { id: callId },
			relations: ['from']
		})
		if (!call) throw new NotFoundException('Call not found')

		const user = await this.userService.findOneById(userId)
		if (!user) throw new NotFoundException('User not found')
		if (call.from.id !== userId)
			throw new NotFoundException('User not authorized to close call')

		call.status = CallStatus.ENDED
		call.endTime = new Date().toISOString()
		return await this.callRepository.save(call)
	}

	// Отклонить звонок
	async rejectCall(callId: number, userId: number) {
		const call = await this.callRepository.findOne({
			where: { id: callId }
		})
		if (!call) throw new NotFoundException('Call not found')

		const user = await this.userService.findOneById(userId)
		if (!user) throw new NotFoundException('User not found')

		if (call.isGroup)
			throw new NotFoundException('Group call cannot be rejected')

		call.status = CallStatus.REJECTED
		call.endTime = new Date().toISOString()
		return await this.callRepository.save(call)
	}

	async updateCall(callId: number, userId: number, dto: any) {
		const call = await this.callRepository.findOne({
			where: { id: callId }
		})
		if (!call) throw new NotFoundException('Call not found')

		const user = await this.userService.findOneById(userId)
		if (!user) throw new NotFoundException('User not found')

		// Обновляем данные участника
		call.participants = call.participants.map(participant => {
			if (participant.id === userId) {
				participant = { ...participant, ...dto } // Обновляем свойства участника
			}
			return participant // Возвращаем обновленного участника
		})

		return await this.callRepository.save(call)
	}

	// Получить все запросы на звонки для пользователя
	async getRequestedCallsForUser(userId: number) {
		const user = await this.userService.findOneById(userId)
		if (!user) throw new NotFoundException('User not found')

		const requestedCalls = await this.callRepository.findOne({
			where: {}
		})
		return requestedCalls
	}

	// Обновить статус звонка
	async updateCallStatus(callId: number, userId: number, status: CallStatus) {
		const call = await this.callRepository.findOne({
			where: { id: callId }
		})
		if (!call) throw new NotFoundException('Call not found')

		const participant = call.participants.find(p => p.id === userId)
		if (!participant) throw new NotFoundException('User not found in the call')

		participant.callStatus = status
		await this.callRepository.save(call)

		return participant
	}

	// Обновить сигнал участника
	async updateCallSignal(callId: number, userId: number, signal: any) {
		console.log(callId, userId, signal)
		const call = await this.callRepository.findOne({
			where: { id: callId }
		})
		if (!call) throw new NotFoundException('Call not found')

		const participant = call.participants.find(p => p.id === userId)
		if (!participant) throw new NotFoundException('User not found in the call')

		participant.signals.push(signal)
		await this.callRepository.save(call)

		return { participant, call }
	}
}
