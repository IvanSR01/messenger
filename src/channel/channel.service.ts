import {
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Channel } from './channel.entity'
import { Repository } from 'typeorm'
import { UserService } from 'src/user/user.service'
import { CreateChannelDto } from './dto/create-channel.dto'
import { UpdateChannelDto } from './dto/update-channel.dto'

@Injectable()
export class ChannelService {
	constructor(
		@InjectRepository(Channel)
		private readonly channelRepository: Repository<Channel>,
		private readonly userService: UserService
	) {}

	async findAll(): Promise<Channel[]> {
		return await this.channelRepository.find()
	}

	async findOne(id: number): Promise<Channel> {
		return await this.channelRepository.findOneBy({ id })
	}

	async save(dto: CreateChannelDto): Promise<Channel> {
		const user = await this.userService.findOneById(dto.userId)

		if (!user) throw new NotFoundException('User not found')

		return await this.channelRepository.save({
			...dto,
			user,
			link: await this.genLink(dto.name)
		})
	}

	async update({
		channel,
		userId,
		channelId
	}: UpdateChannelDto): Promise<string> {
		const channelToUpdate = await this.channelRepository.findOneBy({
			id: channelId
		})

		if (!channelToUpdate) throw new NotFoundException('Channel not found')
		const user = await this.userService.findOneById(userId)

		if (channelToUpdate.author.id !== userId && user?.role === 'user')
			throw new ForbiddenException('You are not allowed to update this channel')

		await this.channelRepository.update({ id: channelToUpdate.id }, channel)

		return 'success'
	}

	async remove(id: number, userId: number): Promise<void> {
		const channel = await this.channelRepository.findOneBy({ id })
		const user = await this.userService.findOneById(userId)

		if (!channel) throw new NotFoundException('Channel not found')

		if (channel.author.id !== userId && user?.role === 'user')
			throw new ForbiddenException('You are not allowed to delete this channel')

		await this.channelRepository.remove(channel)
	}

	async genLink(name: string) {
		const code = Math.ceil(Math.random() * 1000000)

		const link = `${name}-${code}`

		const channel = await this.channelRepository.findOneBy({ link })

		if (channel) return await this.genLink(name)

		return link
	}
}
