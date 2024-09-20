import { Post } from 'src/post/post.entity'
import { User } from 'src/user/user.entity'
import {
	Column,
	Entity,
	JoinTable,
	ManyToMany,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class Channel {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	name: string

	@Column()
	avatar: string

	@Column()
	description: string

	@Column()
	link: string

	@Column({ nullable: true })
	background: string | null

	@ManyToOne(() => User, user => user.channelCreation)
	@JoinTable()
	author: User

	@ManyToMany(() => User, user => user.channel)
	@JoinTable()
	subscriptions: User[]

	@OneToMany(() => Post, post => post.channel)
	@JoinTable()
	posts: Post[]
}
