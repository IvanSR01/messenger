// user.entity.ts

import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToMany,
	OneToMany,
	JoinTable
} from 'typeorm'
import { Message } from 'src/message/message.entity'
import { PinnedChat } from 'src/pinned/pinned.entity'
import { Chat } from 'src/chat/chat.entity'
import { Channel } from 'src/channel/channel.entity'
import { Post } from 'src/post/post.entity'
import { Reaction } from 'src/reaction/reaction.entity'
import { Comment } from 'src/comment/comment.entity'

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true, nullable: true })
	email: string

	@Column({
		nullable: true
	})
	isVerified: boolean

	@Column({
		default: 'user'
	})
	role: 'user' | 'admin-level-one' | 'admin-level-two'

	@Column()
	password: string

	@Column({ nullable: true })
	oauthId: string

	@Column({ default: '' })
	username: string

	@Column({ default: '' })
	picture: string

	@Column({ default: '' })
	fullName: string

	@Column({
		type: 'jsonb',
		default: {
			isOnline: false,
			lastSeen: new Date()
		}
	})
	status: {
		isOnline: boolean
		lastSeen: Date
	}
	@Column({
		default: 'ENG',
		nullable: true
	})
	language: string

	@Column()
	secreteKeyJwtHash: string

	@ManyToMany(() => Chat, chat => chat.users)
	chats: Chat[]

	@OneToMany(() => Chat, chat => chat.creator)
	chatsCreated: Chat[]

	@ManyToMany(() => Channel, channel => channel.subscriptions)
	channel: Channel[]

	@OneToMany(() => Channel, channel => channel.author)
	channelCreation: Channel[]

	@OneToMany(() => Post, post => post.author)
	posts: Post[]

	@OneToMany(() => Reaction, reaction => reaction.user)
	reactions: Reaction[]

	@OneToMany(() => Comment, comment => comment.user)
	comments: Comment[]

	@OneToMany(() => Message, message => message.user)
	messages: Message[]

	@ManyToMany(() => User)
	@JoinTable()
	contact: User[]

	@OneToMany(() => PinnedChat, pinnedChat => pinnedChat.user)
	pinnedChats: PinnedChat[]
}
