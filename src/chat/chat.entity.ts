import { Entity, Column, PrimaryGeneratedColumn, ManyToMany, OneToMany, JoinTable } from 'typeorm';
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
        default: 'https://image.flaticon.com/icons/png/512/3135/3135715.png',
        nullable: true
    })
    img: string;

    @Column({
        type: 'boolean',
        default: false
    })
    isPersonal: boolean;

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
