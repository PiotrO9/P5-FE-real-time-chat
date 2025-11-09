export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export interface FriendResponse {
	id: string
	username: string
	email: string
	isOnline: boolean
	lastSeen: string
	createdAt: string
	friendshipCreatedAt: string
}

export interface FriendsListResponse {
	friends: FriendResponse[]
	count: number
}

export interface InviteUser {
	id: string
	username: string
	email: string
	isOnline: boolean
}

export interface Invite {
	id: string
	status: InviteStatus
	createdAt: string
	receiver?: InviteUser
	sender?: InviteUser
}

export interface InvitesResponse {
	sentInvites: Invite[]
	receivedInvites: Invite[]
	totalSent: number
	totalReceived: number
	totalPending: number
}

export interface InviteResponse {
	id: string
	status: 'PENDING'
}

export interface FriendshipResponse {
	requester: FriendResponse
	addressee: FriendResponse
}

export interface DeleteFriendResponse {
	deletedFriend: FriendResponse
	deletedAt: string
}
