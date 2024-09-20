import { Module } from '@nestjs/common'
import { CommentController } from './comment.controller'
import { CommentService } from './comment.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from './comment.entity'
import { UserService } from 'src/user/user.service'
import { PostService } from 'src/post/post.service'
import { UserModule } from 'src/user/user.module'
import { PostModule } from 'src/post/post.module'

@Module({
	controllers: [CommentController],
	providers: [CommentService],
	imports: [TypeOrmModule.forFeature([Comment]), UserModule, PostModule]
})
export class CommentModule {}
