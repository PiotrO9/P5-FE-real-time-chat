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
	chatId: number
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
		chatId?: string | number
		updates?: any
	}
}

export type Chat = {
	createdAt: string
	id: number
	isGroup: boolean
	lastMessage: Message
	name: string
	avatar?: string
	otherUser: User
	unreadCount: number
	messages: Message[]
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
