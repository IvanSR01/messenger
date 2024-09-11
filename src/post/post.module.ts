import { Module, Post } from '@nestjs/common'
import { ChannelService } from 'src/channel/channel.service'
import { PostService } from './post.service'
import { PostController } from './post.controller'
import { TypeOrmModule } from '@nestjs/typeorm'

@Module({
	imports: [ChannelService, PostService, TypeOrmModule.forFeature([Post])],
	controllers: [PostController],
	providers: [PostService],
	exports: [PostService],
})
export class PostModule {}
