import { Chat } from 'src/chat/chat.entity'
import { User } from 'src/user/user.entity'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class Message {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	content: string

	@ManyToOne(() => Chat, chat => chat.messages)
	chat: Chat

	@ManyToOne(() => User, user => user.messages)
	user: User

	@Column({
		type: 'boolean',
		default: false
	})
	isRead: boolean

	@Column({
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP'
	})
	sendTime: Date

	@Column({
		type: 'boolean',
		default: false
	})
	isEdited: boolean

	@Column({
		type: 'jsonb',
		default: {
			id: null,
			type: 'message'
		}
	})
	linkMessage: {
		id: number | null
		type: 'message' | 'channel'
	}
}
