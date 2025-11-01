export interface User {
	username: string
	email: string
	lastSeen: string
	createdAt: string
	id: string
}

export type Message = {
	id: number
	chatId: number
	senderId: number
	senderUsername: string
	content: string
	createdAt: string
}

export type Chat = {
	id: number
	name: string
	avatar?: string
	lastMessage: Message
	unreadCount: number
	messages: Message[]
}
