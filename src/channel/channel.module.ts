import { Module } from '@nestjs/common'
import { ChannelService } from './channel.service'
import { ChannelController } from './channel.controller'
import { UserService } from 'src/user/user.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Channel } from './channel.entity'
import { UserModule } from 'src/user/user.module'

@Module({
	imports: [ TypeOrmModule.forFeature([Channel]), UserModule,],
	providers: [ChannelService],
	controllers: [ChannelController],
	exports: [ChannelService]
})
export class ChannelModule {}
