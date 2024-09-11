import { Auth } from 'src/auth/decorators/auth.decorator'
import { ReactionService } from './reaction.service'
import { Body, Controller, Delete, Param, Post } from '@nestjs/common'
import { UserData } from 'src/user/decorators/user.decorator'
import { CreateReactionDto, CreateReactionTypeDto } from './dto/create.dto'
import { AdminLevel } from 'src/auth/decorators/admin.decorator'

@Controller('reaction')
export class ReactionController {
	constructor(private readonly reactionService: ReactionService) {}

	@Post('create-to-post')
	@Auth()
	async createReactionForPost(
		@UserData('id') userId: number,
		@Body() dto: CreateReactionDto
	) {
		return await this.reactionService.createReacitonForPost({ ...dto, userId })
	}

	@Delete('remove-to-post/:id')
	@Auth()
	async removeReactionForPost(@Param('id') id: number) {
		return await this.reactionService.removeReactionForPost(id)
	}

	@Post('create-reaction-type')
	@Auth()
	@AdminLevel('admin-level-one')
	async createReactionType(@Body() dto: CreateReactionTypeDto) {
		return await this.reactionService.createReactionType(dto)
	}

	@Delete('remove-reaction-type/:id')
	@Auth()
	@AdminLevel('admin-level-one')
	async removeReactionType(@Param('id') id: number) {
		return await this.reactionService.removeReactionType(id)
	}
}
