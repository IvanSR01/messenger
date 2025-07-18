import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { ChannelModule } from './channel/channel.module'
import { Chat } from './chat/chat.entity'
import { ChatModule } from './chat/chat.module'
import { CommentModule } from './comment/comment.module'
import { MailModule } from './mail/mail.module'
import { Message } from './message/message.entity'
import { MessageModule } from './message/message.module' // Импортировать MessageModule
import { PinnedChat } from './pinned/pinned.entity'
import { PostModule } from './post/post.module'
import { ReactionModule } from './reaction/reaction.module'
import { UploadModule } from './upload/upload.module'
import { User } from './user/user.entity'
import { UserModule } from './user/user.module'
import { Post } from './post/post.entity'
import { Reaction } from './reaction/reaction.entity'
import { ReactionType } from './reaction/reaction-type.entity'
import { Channel } from './channel/channel.entity'
import { Comment } from './comment/comment.entity'
import { CallGateway } from './call/call.gateway'
import { CallModule } from './call/call.module'
import { Call } from './call/call.entity'
@Module({
	imports: [
		// Настройка ConfigModule для загрузки переменных окружения из .env файла
		ConfigModule.forRoot({
			isGlobal: true, // Делает конфигурацию доступной во всем приложении
			envFilePath: '.env' // Указывает путь к файлу .env
		}),
		// Настройка TypeOrmModule
		TypeOrmModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (configService: ConfigService) => ({
				type: 'postgres',
				host: configService.get<string>('DB_HOST'),
				port: configService.get<number>('DB_PORT'),
				username: configService.get<string>('DB_USER'),
				password: configService.get<string>('DB_PASSWORD'),
				database: configService.get<string>('DB_NAME'),
				entities: [
					User,
					Chat,
					Message,
					PinnedChat,
					Post,
					Reaction,
					ReactionType,
					Channel,
					Comment,
					Call,
				],
				synchronize: true // В продакшене рекомендуется установить false
			})
		}),
		AuthModule, // Другие модули
		UserModule,
		ChatModule,
		MessageModule,
		MailModule,
		UploadModule,
		ChannelModule,
		PostModule,
		ReactionModule,
		CommentModule,
		CallModule
		// PinnedModule // Добавить MessageModule,
	],
	providers: [],
	controllers: []
})
export class AppModule {}
