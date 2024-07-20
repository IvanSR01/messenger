import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { Chat } from 'src/chat/chat.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async create(content: string, chat: Chat, user: User): Promise<Message> {
		console.log(content)
    const message = this.messageRepository.create({ content, chat, user });
    return this.messageRepository.save(message);
  }

  async markAsRead(id: number): Promise<void> {
    await this.messageRepository.update(id, { isRead: true });
  }

  async findByChat(chat: Chat): Promise<Message[]> {
    return this.messageRepository.find({ where: { chat }, relations: ['user'] });
  }
}
