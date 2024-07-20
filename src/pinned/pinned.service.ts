// pinned-chat.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Chat } from 'src/chat/chat.entity';
import { PinnedChat } from './pinned.entity';

@Injectable()
export class PinnedService {
    constructor(
        @InjectRepository(PinnedChat)
        private readonly pinnedChatRepository: Repository<PinnedChat>
    ) {}

    async pinChat(user: User, chat: Chat): Promise<PinnedChat> {
        const pinnedChat = new PinnedChat();
        pinnedChat.user = user;
        pinnedChat.chat = chat;
        return this.pinnedChatRepository.save(pinnedChat);
    }

    async unpinChat(user: User, chat: Chat): Promise<void> {
        await this.pinnedChatRepository.delete({ user, chat });
    }

    async getPinnedChats(user: User): Promise<PinnedChat[]> {
        return this.pinnedChatRepository.find({
            where: { user },
            relations: ['chat']
        });
    }
}
