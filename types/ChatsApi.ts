export type UUID = string

export type Role = 'OWNER' | 'MODERATOR' | 'MEMBER'
export type ChatListItem = GroupChatItem | DirectChatItem

export interface ChatMember {
	id: UUID
	username: string
	email: string
	isOnline: boolean
	lastSeen: string
	role: Role
	joinedAt: string
}

export interface LastMessage {
	id: UUID
	content: string
	senderId: UUID
	senderUsername: string
	createdAt: string
	wasUpdated: boolean
}

export interface OtherUser {
	id: UUID
	username: string
	email: string
	isOnline: boolean
	lastSeen: string
	createdAt: string
}

export interface GroupChatItem {
	id: UUID
	name: string
	isGroup: true
	createdAt: string
	updatedAt: string
	lastMessage: LastMessage | null
	unreadCount: number
	members: ChatMember[]
	memberCount: number
	hasOnlineMembers: boolean
}

export interface DirectChatItem {
	id: UUID
	name: string | null
	isGroup: false
	createdAt: string
	updatedAt: string
	lastMessage: LastMessage | null
	unreadCount: number
	otherUser: OtherUser
	hasOnlineMembers: boolean
}

export interface ChatsResponse {
	chats: ChatListItem[]
	total: number
}
