import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { Chat } from './chat/chat.entity'
import { ChatModule } from './chat/chat.module'
import { MailModule } from './mail/mail.module'
import { Message } from './message/message.entity'
import { MessageModule } from './message/message.module' // Импортировать MessageModule
import { UploadModule } from './upload/upload.module'
import { User } from './user/user.entity'
import { UserModule } from './user/user.module'
import { PinnedService } from './pinned/pinned.service';
import { PinnedModule } from './pinned/pinned.module';
import { PinnedChat } from './pinned/pinned.entity'

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
        entities: [User, Chat, Message, PinnedChat],
        synchronize: true, // В продакшене рекомендуется установить false
      }),
    }),
		// Другие модули
		AuthModule,
		UserModule,
		ChatModule,
		MessageModule,
		MailModule,
		UploadModule,
		// PinnedModule // Добавить MessageModule,
	],
	providers: []
})
export class AppModule {}
