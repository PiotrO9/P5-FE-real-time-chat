export type UUID = string

export interface MessageReadItem {
	userId: UUID
	username: string
	readAt: string
}

export interface Reaction {
	emoji: string
	userId: UUID
	username: string
}

export interface MessagesApiItem {
	id: UUID
	chatId: UUID
	senderId: UUID
	senderUsername: string
	content: string
	wasUpdated: boolean
	createdAt: string
	updatedAt: string
	replyTo: UUID | null
	reactions: Reaction[]
	reads: MessageReadItem[]
}

export interface MessagesResponse {
	messages: MessagesApiItem[]
	total: number
	hasMore: boolean
}
