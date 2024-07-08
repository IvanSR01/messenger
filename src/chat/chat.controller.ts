import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ChatService } from './chat.service'
import { UserData } from 'src/user/decorators/user.decorator'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { Chat } from './chat.entity'
import { CreateChatDto } from './dto/chat.dto'

@Controller('chat')
export class ChatController {
	constructor(private readonly chatService: ChatService) {}

	@Get('all')
	@Auth()
	async findAll(@UserData('id') id: number) {
		return this.chatService.findAll(id)
	}

	@Get(':id')
	@Auth()
	async findOne(@Param('id') chatId: number) {
		return this.chatService.findOne(chatId)
	}

	@Get('user-chat/:id')
	@Auth()
	async findByUserId(@UserData('id') id: number, @Param('id') userId: number) {
		return this.chatService.findByUserId(id, userId)
	}
	@Post('create-chat')
	@Auth()
	async createChat(@UserData('id') id: number, @Body() dto: CreateChatDto) {
		return await this.chatService.create({ ...dto, ids: [...dto.ids, id] })
	}

	@Put('update-chat')
	@Auth()
	async updateChat(
		@UserData('id') id: number,
		@Body() chatData: Partial<Chat>
	) {
		return await this.chatService.update(id, chatData)
	}

	@Delete('delete-chat')
	@Auth()
	async deleteChat(@UserData('id') id: number, @Param('id') chatId: number) {
		return await this.chatService.remove(chatId)
	}
}
