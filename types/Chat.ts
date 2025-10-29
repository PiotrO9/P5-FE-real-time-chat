export interface User {
	username: string
	email: string
	lastSeen: string
	createdAt: string
}

export type Message = {
	id: number
	chatId: number
	senderId: number
	senderName: string
	content: string
	createdAt: string
}

export type Chat = {
	id: number
	name: string
	avatar?: string
	lastMessage: string
	unreadCount: number
	messages: Message[]
}
