import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ChatController } from './chat.controller'
import { Chat } from './chat.entity'
import { ChatService } from './chat.service'
import { UserModule } from 'src/user/user.module'

@Module({
	imports: [TypeOrmModule.forFeature([Chat]), UserModule], // Подключение сущности Chat
	providers: [ChatService],
	controllers: [ChatController],
	exports: [ChatService],
})
export class ChatModule {}
