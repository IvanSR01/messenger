import { Message } from 'src/message/message.entity'
import { User } from 'src/user/user.entity'
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class Chat {
	@PrimaryGeneratedColumn()
	id: number

	@ManyToMany(() => User, user => user.chats)
	@JoinTable()
	users: User[]

	@OneToMany(() => Message, message => message.chat)
	messages: Message[]

	@Column()
	name: string

	@Column()
	img: string

	@Column({
		type: 'boolean',
		default: false
	})
	isPersonal: boolean

	@Column({
		type: 'date',
		default: () => 'CURRENT_TIMESTAMP'
	})
	createdAt: Date
}
