import { Module } from '@nestjs/common'
import { ChannelService } from 'src/channel/channel.service'
import { PostService } from './post.service'
import { PostController } from './post.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from 'src/user/user.module'
import { ChannelModule } from 'src/channel/channel.module'
import { Post } from './post.entity'

@Module({
	imports: [UserModule, ChannelModule, TypeOrmModule.forFeature([Post])],
	controllers: [PostController],
	providers: [PostService],
	exports: [PostService],
})
export class PostModule {}
