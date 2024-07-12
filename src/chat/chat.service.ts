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

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Chat)
		private readonly chatRepository: Repository<Chat>,
		private readonly userService: UserService
	) {}

	findAll(operationUserId: number): Promise<Chat[]> {
		return this.chatRepository.find({
			where: {
				users: [{ id: operationUserId }]
			},
			relations: ['users', 'messages']
		})
	}

	findOne(id: number): Promise<Chat> {
		return this.chatRepository.findOne({
			where: { id: id },
			relations: ['users', 'messages']
		})
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
		const users = []
		for (const id of dto.ids) {
			const user = await this.userService.findOneById(id)
			const lastUser = await this.userService.findOneById(id)
			if (!user || !lastUser) {
				new NotFoundException('Users not found')
				return null
			} else if (user.id === lastUser.id) return null
			if (!dto.isPersonal && !user.contact.includes(lastUser)) {
				new ConflictException(
					'You cannot add a person to a group chat who does not have you in contacts'
				)
				return null
			}
			users.push(user)
		}
		const chat = this.chatRepository.create({
			...dto,
			users: users,
			messages: []
		})
		return await this.chatRepository.save(chat)
	}

	async update(id: number, chatData: Partial<Chat>): Promise<Chat> {
		await this.chatRepository.update(id, chatData)
		return this.chatRepository.findOne({ where: { id: id } })
	}

	async remove(id: number): Promise<void> {
		await this.chatRepository.delete(id)
	}
}
