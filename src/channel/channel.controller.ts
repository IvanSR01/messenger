import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	Put
} from '@nestjs/common'
import { ChannelService } from './channel.service'
import { Channel } from './channel.entity'
import { Auth } from 'src/auth/decorators/auth.decorator'
import { CreateChannelDto } from './dto/create-channel.dto'
import { UserData } from 'src/user/decorators/user.decorator'

@Controller('channel')
export class ChannelController {
	constructor(private readonly channelService: ChannelService) {}

	@Get('/all')
	async findAll(): Promise<Channel[]> {
		return await this.channelService.findAll()
	}

	@Get('/one/:id')
	async findOne(@Param('id') id: number): Promise<Channel> {
		return await this.channelService.findOne(id)
	}

	@Get('/sub/')
	@Auth()
	async findMySubsChannel(@UserData('id') id: number): Promise<Channel[]> {
		return await this.channelService.findMySubsChannel(id)
	}

	@Post('/create')
	@Auth()
	async save(
		@Body() dto: CreateChannelDto,
		@UserData('id') id: number
	): Promise<Channel> {
		return await this.channelService.save({ ...dto, userId: id })
	}

	@Put('/update/:id')
	@Auth()
	async update(
		@Param('id') id: number,
		@Body() channel: Channel,
		@UserData('id') userId: number
	): Promise<string> {
		return await this.channelService.update({
			channel,
			userId: userId,
			channelId: id
		})
	}

	@Patch('/toggle-subscription/:id')
	@Auth()
	async toggleSubscription(
		@Param('id') id: number,
		@UserData('id') userId: number
	) {
		return await this.channelService.toggleSubscription(id, userId)
	}

	@Delete('/delete/:id')
	@Auth()
	async remove(
		@Param('id') id: number,
		@UserData('id') userId: number
	): Promise<void> {
		await this.channelService.remove(id, userId)
	}
}
