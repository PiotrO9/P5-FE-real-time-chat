export type UUID = string

export interface MessageReadItem {
	userId: UUID
	username: string
	readAt: string
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
	reactions: unknown[]
	reads: MessageReadItem[]
}

export interface MessagesResponse {
	messages: MessagesApiItem[]
	total: number
	hasMore: boolean
}
