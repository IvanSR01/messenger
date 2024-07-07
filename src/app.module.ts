import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from './auth/auth.module'
import { User } from './user/user.entity'
import { UserModule } from './user/user.module'
import { Chat } from './chat/chat.entity'
import { Message } from './message/message.entity'
import { ChatModule } from './chat/chat.module';

@Module({
	imports: [
		// Настройка ConfigModule для загрузки переменных окружения из .env файла
		ConfigModule.forRoot({
			isGlobal: true, // Делает конфигурацию доступной во всем приложении
			envFilePath: '.env' // Указывает путь к файлу .env
		}),
		// Настройка TypeOrmModule
		TypeOrmModule.forRoot({
			type: 'postgres',
			host: 'localhost',
			port: 5432,
			username: 'postgres',
			password: '070707',
			database: 'messenger',
			entities: [User, Chat, Message],
			synchronize: true
		}),
		// Другие модули
		AuthModule,
		UserModule,
		ChatModule
	]
})
export class AppModule {}
