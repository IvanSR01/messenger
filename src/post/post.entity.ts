import { Channel } from 'src/channel/channel.entity'
import { Comment } from 'src/comment/comment.entity'
import { Reaction } from 'src/reaction/reaction.entity'
import { User } from 'src/user/user.entity'
import {
	Column,
	Entity,
	JoinTable,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn
} from 'typeorm'
import { EntityRepository, Repository } from 'typeorm'

@Entity()
export class Post {
	@PrimaryGeneratedColumn()
	id: number

	@Column()
	content: string

	@Column({
		nullable: true
	})
	linkId: number | null

	@Column({
		default: 0
	})
	view: number

	@Column({
		type: 'timestamp',
		default: () => 'CURRENT_TIMESTAMP'
	})
	sendTime: Date

	@OneToMany(() => Reaction, reaction => reaction.post)
	@JoinTable()
	reactions: Reaction[]

	@ManyToOne(() => Channel, channel => channel.posts)
	@JoinTable()
	channel: Channel

	@ManyToOne(() => User, user => user.posts)
	@JoinTable()
	author: User

	@OneToMany(() => Comment, comment => comment.post)
	@JoinTable()
	comments: Comment[]
}

@EntityRepository(Post)
export class PostRepository extends Repository<Post> {}
