import type { ChatMember, Role } from './ChatsApi'

export interface User {
	username: string
	email: string
	lastSeen: string
	createdAt: string
	id: string
}

export interface Reaction {
	emoji: string
	userIds: (number | string)[]
	username: string
}

export type SystemMessageType = 'member:added' | 'member:removed' | 'chat:created' | 'chat:updated'

export type Message = {
	id: number
	chatId: string
	senderId: number
	senderUsername: string
	content: string
	createdAt: string
	reactions?: Reaction[]
	isSystem?: boolean
	systemType?: SystemMessageType
	systemData?: {
		userId?: string | number
		username?: string
		chatId?: string
		updates?: any
	}
	isPinned?: boolean
	pinnedBy?: {
		id: number | string
		username: string
	}
	pinnedAt?: string
	edited?: boolean
	editedAt?: string
	replyTo?: {
		id: number | string
		content: string
		senderUsername: string
	}
}

export type Chat = {
	createdAt: string
	id: string
	isGroup: boolean
	lastMessage: Message
	name: string
	avatar?: string
	otherUser: User
	unreadCount: number
	messages: Message[]
	members?: ChatMember[]
	currentUserRole?: Role
}

export interface Friend {
	id: string | number
	username: string
	email: string
	avatar?: string
	lastSeen?: string
	isOnline?: boolean
	friendshipCreatedAt?: string
	createdAt?: string
}
