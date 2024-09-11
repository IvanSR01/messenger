import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable, ManyToOne } from 'typeorm';
import { Message } from 'src/message/message.entity';
import { User } from 'src/user/user.entity';
import { PinnedChat } from 'src/pinned/pinned.entity';

// chat.entity.ts

@Entity()
export class Chat {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToMany(() => User, user => user.chats)
    @JoinTable()
    users: User[];

    @OneToMany(() => Message, message => message.chat)
    messages: Message[];

    @Column()
    name: string;

    @Column({
        nullable: true
    })
    avatar: string;

		@ManyToOne(() => User, user => user.chatsCreated)
		@JoinTable()
		creator : User

    @Column({
        type: 'boolean',
        default: false
    })
    isPersonal: boolean;


		@Column({
			nullable: true
		})
    background: string | null;

    @Column({
        type: 'date',
        default: () => 'CURRENT_TIMESTAMP'
    })
    createdAt: Date;

    @ManyToMany(() => User)
    @JoinTable()
    typing: User[];

    @OneToMany(() => PinnedChat, pinnedChat => pinnedChat.chat)
    pinnedByUsers: PinnedChat[];
}
