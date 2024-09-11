import { Module } from '@nestjs/common'
import { ReactionService } from './reaction.service'
import { ReactionController } from './reaction.controller'
import { UserService } from 'src/user/user.service'
import { PostService } from 'src/post/post.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Reaction } from './reaction.entity'
import { ReactionType } from './reaction-type.entity'

@Module({
	imports: [
		UserService,
		PostService,
		TypeOrmModule.forFeature([Reaction, ReactionType])
	],
	providers: [ReactionService],
	controllers: [ReactionController]
})
export class ReactionModule {}
