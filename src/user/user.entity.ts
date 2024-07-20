import { Chat } from 'src/chat/chat.entity';
import { Message } from 'src/message/message.entity';
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToMany,
    OneToMany,
    JoinTable
} from 'typeorm';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    isVerified: boolean;

    @Column()
    password: string;

    @Column({ nullable: true })
    oauthId: string;

    @Column({ default: '' })
    username: string;

    @Column({ default: '' })
    picture: string;

    @Column({ default: '' })
    fullName: string;

    @Column()
    secreteKeyJwtHash: string;

    @ManyToMany(() => Chat, chat => chat.users)
    chats: Chat[];

    @OneToMany(() => Message, message => message.user)
    messages: Message[];

    @ManyToMany(() => User)
    @JoinTable()
    contact: User[];
}