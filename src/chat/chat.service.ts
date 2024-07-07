import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Chat } from './chat.entity'

@Injectable()
export class ChatService {
	constructor(
		@InjectRepository(Chat)
		private readonly chatRepository: Repository<Chat>
	) {}

	findAll(): Promise<Chat[]> {
		return this.chatRepository.find({ relations: ['users', 'messages'] })
	}

	findOne(id: number): Promise<Chat> {
		return this.chatRepository.findOne({
			where: { id: id },
			relations: ['users', 'messages']
		})
	}

	async create(chatData: Partial<Chat>): Promise<Chat> {
		const chat = this.chatRepository.create(chatData)
		return this.chatRepository.save(chat)
	}

	async update(id: number, chatData: Partial<Chat>): Promise<Chat> {
		await this.chatRepository.update(id, chatData)
		return this.chatRepository.findOne({ where: { id: id } })
	}

	async remove(id: number): Promise<void> {
		await this.chatRepository.delete(id)
	}
}
