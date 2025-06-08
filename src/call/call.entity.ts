import { Chat } from 'src/chat/chat.entity'
import { User } from 'src/user/user.entity'
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	ManyToMany,
	JoinTable,
	OneToMany
} from 'typeorm'

export enum CallStatus {
	REQUESTED = 'requested',
	ACTIVE = 'active',
	REJECTED = 'rejected',
	ENDED = 'ended'
}
@Entity()
export class Call {
	@PrimaryGeneratedColumn()
	id: number

	@Column({
		default: '',
		nullable: true
	})
	name: string | null

	@Column({
		default: ''
	})
	duration: string

	@Column({
		default: () => 'CURRENT_TIMESTAMP'
	})
	startTime: string

	@Column({
		default: () => 'CURRENT_TIMESTAMP'
	})
	endTime: string
	@Column({
		type: 'jsonb'
	})
	from: {
		id: number
		username: string
		fullName: string
		action: {
			isVideoActive: boolean
			isAudioActive: boolean
		}
		callStatus: CallStatus
		signals: any[]
	}
	@Column({
		type: 'jsonb'
	})
	to: {
		id: number
		username: string
		fullName: string
		action: {
			isVideoActive: boolean
			isAudioActive: boolean
		}
		callStatus: CallStatus
		signals: any[]
	}[]
	@Column({
		type: 'jsonb'
	})
	participants: {
		id: number
		username: string
		fullName: string
		action: {
			isVideoActive: boolean
			isAudioActive: boolean
		}
		callStatus: CallStatus
		signals: any[]
		startTime?: any
	}[]

	@Column({
		type: 'enum',
		enum: ['audio', 'video'],
		default: 'audio'
	})
	callType: 'audio' | 'video'

	@Column()
	chatId: number

	@Column({
		type: 'enum',
		enum: CallStatus,
		default: CallStatus.REQUESTED
	})
	status: CallStatus

	@Column({
		default: false
	})
	isGroup: boolean
}
