import { UserRepository } from './../user/user.repository'
import {
	ConflictException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Chat } from './chat.entity'
import { CreateChatDto } from './dto/chat.dto'
import { UserService } from 'src/user/user.service'
import { User } from 'src/user/user.entity'

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Chat)
		private readonly chatRepository: Repository<Chat>,
		private readonly userService: UserService
	) {}
	async findAll(operationUserId: number): Promise<any[]> {
		const user = await this.userService.findOneById(operationUserId)

		let chats = await this.chatRepository.find({
			relations: ['users', 'messages', 'typing', 'pinnedByUsers']
		})

		const userChats = chats.filter(chat =>
			chat.users.some(chatUser => chatUser.id === user.id)
		)

		userChats.forEach(chat => {
			chat.messages
				.sort(
					(a, b) =>
						new Date(b.sendTime).getTime() - new Date(a.sendTime).getTime()
				)
				.reverse()
		})

		userChats.sort((a, b) => {
			const lastMessageA = a.messages.length
				? new Date(a.messages[a.messages.length - 1].sendTime).getTime()
				: 0
			const lastMessageB = b.messages.length
				? new Date(b.messages[b.messages.length - 1].sendTime).getTime()
				: 0
			return lastMessageB - lastMessageA
		})

		return userChats
	}

	async findOne(id: number): Promise<Chat> {
		return await this.chatRepository.findOne({
			where: { id: id },
			relations: ['messages', 'users', 'typing', 'pinnedByUsers']
		})
	}

	save(chat: Chat): Promise<Chat> {
		return this.chatRepository.save(chat)
	}
	async findByUserId(myId: number, userId: number): Promise<Chat> {
		const chat = await this.chatRepository.findOne({
			where: { id: userId },
			relations: ['users', 'messages']
		})
		if (!chat) {
			const user = await this.userService.findOneById(userId)
			return await this.create({
				ids: [myId, userId],
				isPersonal: true,
				name: user.username,
				img: user.picture
			})
		}
		return chat
	}

	async create(dto: CreateChatDto): Promise<Chat | null> {
		const users: User[] = []

		// Проверяем существование последнего пользователя
		const lastUser = await this.userService.findOneById(
			dto.ids[dto.ids.length - 1]
		)
		if (!lastUser) {
			throw new NotFoundException(
				`User with ID ${dto.ids[dto.ids.length - 1]} not found`
			)
		}
		users.push(lastUser)

		for (const id of dto.ids) {
			const user = await this.userService.findOneById(id)
			if (!user) {
				throw new NotFoundException(`User with ID ${id} not found`)
			}

			if (user.id !== lastUser.id) {
				const isInContacts = await this.userService.areUsersInContacts(
					user.id,
					lastUser.id
				)
				// if (!dto.isPersonal && !isInContacts) {
				// 	throw new ConflictException(
				// 		'You cannot add a person to a group chat who does not have you in contacts'
				// 	)
				// }

				users.push(user)
			}
		}

		const chat = this.chatRepository.create({
			...dto,
			users: users,
			messages: []
		})

		await this.chatRepository.save(chat)
		return chat
	}

	async toggleUser(chatId: number, userId: number): Promise<Chat> {
		const chat = await this.chatRepository.findOne({
			where: { id: chatId },
			relations: ['users']
		})
		if (!chat) {
			throw new NotFoundException(`Chat with ID ${chatId} not found`)
		}
		if (!chat.users.some(user => user.id === userId)) {
			chat.users.push(await this.userService.findOneById(userId))
		} else {
			chat.users = chat.users.filter(user => user.id !== userId)
		}
		await this.chatRepository.save(chat)
		return chat
	}

	async update(id: number, chat: Partial<Chat>) {
		const chatToUpdate = await this.chatRepository.findOne({
			where: { id: chat.id }
		})
		if (!chatToUpdate)
			throw new NotFoundException(`Chat with ID ${chat.id} not found`)
		const chatData = {
			isPersonal: chat.isPersonal,
			name: chat.name,
			avatar: chat.avatar,
			background: chat.background
		}
		return await this.chatRepository.save({ ...chatToUpdate, ...chatData })
	}

	async remove(id: number): Promise<void> {
		await this.chatRepository.delete(id)
	}
}
