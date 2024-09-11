import { Channel } from "../channel.entity"

export class UpdateChannelDto {
	userId: number
	channelId: number
	channel: Partial<Channel>
}