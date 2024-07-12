import { Chat } from 'src/chat/chat.entity'
import { Message } from 'src/message/message.entity'
import {
	Column,
	Entity,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class User {
	@PrimaryGeneratedColumn()
	id: number

	@Column({ unique: true })
	email: string

	@Column()
	password: string

	@Column({ nullable: true })
	githubId: string

	@Column({
		default: ''
	})
	username: string

	@Column({
		default: ''
	})
	picture: string

	@Column({
		default: ''
	})
	fullName: string

	@Column()
	secreteKeyJwtHash: string

	@ManyToMany(() => Chat, chat => chat.users)
	chats: Chat[]

	@OneToMany(() => Message, message => message.user)
	messages: Message[]

	@ManyToMany(() => User, user => user.contact)
	contact: User[]
}
