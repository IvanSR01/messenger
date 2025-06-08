import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Call } from './call.entity'
import { CallService } from './call.service'
import { CallController } from './call.controller'
import { UserModule } from 'src/user/user.module'
import { MessageModule } from 'src/message/message.module'
import { CallGateway } from './call.gateway'

@Module({
	imports: [
		TypeOrmModule.forFeature([Call]),
		UserModule,
		MessageModule
	],
	providers: [CallService, CallGateway],
	controllers: [CallController],
	exports: []
})
export class CallModule {}
