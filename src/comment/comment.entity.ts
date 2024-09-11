import { Post } from 'src/post/post.entity'
import { User } from 'src/user/user.entity'
import {
	Column,
	Entity,
	JoinTable,
	ManyToOne,
	PrimaryGeneratedColumn
} from 'typeorm'

@Entity()
export class Comment {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	content: string

	@Column()
	date: Date

	@ManyToOne(() => User, user => user.comments)
	@JoinTable()
	user: User

	@ManyToOne(() => Post, post => post.comments)
	@JoinTable()
	post: Post
}
