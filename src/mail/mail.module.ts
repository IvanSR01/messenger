import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config' // Импорт ConfigModule
import { MailService } from './mail.service'

@Module({
	imports: [ConfigModule], // Импортируем ConfigModule
	providers: [MailService],
	exports: [MailService]
})
export class MailModule {}
