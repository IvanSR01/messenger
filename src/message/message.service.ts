import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Message } from './message.entity'
import { Chat } from 'src/chat/chat.entity'
import { User } from 'src/user/user.entity'
import { ChatService } from 'src/chat/chat.service'

@Injectable()
export class MessageService {
	constructor(
		@InjectRepository(Message)
		private messageRepository: Repository<Message>,
		private chatService: ChatService
	) {}

	async create(content: string, chat: Chat, user: User): Promise<Message> {
		const message = this.messageRepository.create({ content, chat, user })
		return this.messageRepository.save(message)
	}

	async markAsRead(id: number): Promise<void> {
		await this.messageRepository.update(id, { isRead: true })
	}

	async update(id: number, content: string): Promise<void> {
		await this.messageRepository.update(id, { content, isEdited: true })
	}

	async findByChat(chat: Chat): Promise<Message[]> {
		const messages = await this.messageRepository.find({
			where: { chat: { id: chat.id } }, // добавляем условие фильтрации
			relations: ['user', 'chat'],
			order: { sendTime: 'ASC' }
		})

		return messages
	}

	async getMessage(chatId: number) {
		const chat = await this.chatService.findOne(chatId)

		if (!chat) throw new NotFoundException('Chat not found')
		// return chat.messages
		return await this.findByChat(chat)
	}
}
