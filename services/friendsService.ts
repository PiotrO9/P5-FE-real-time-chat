import type {
	FriendsListResponse,
	InvitesResponse,
	InviteResponse,
	FriendshipResponse,
	DeleteFriendResponse
} from '~/types/FriendsApi'

export async function fetchFriends() {
	return await useApi<ApiResponse<FriendsListResponse>>('GET', '/api/friends')
}

export async function sendFriendInvite(username: string) {
	return await useApi<ApiResponse<{ invite: InviteResponse }>>('POST', '/api/friends/invite', {
		username
	})
}

export async function fetchInvites() {
	return await useApi<ApiResponse<InvitesResponse>>('GET', '/api/friends/invites')
}

export async function acceptInvite(inviteId: string) {
	return await useApi<ApiResponse<{ friendship: FriendshipResponse }>>(
		'PATCH',
		`/api/friends/invites/${inviteId}/accept`
	)
}

export async function rejectInvite(inviteId: string) {
	return await useApi<ApiResponse<{ invite: InvitesResponse['sentInvites'][0] }>>(
		'PATCH',
		`/api/friends/invites/${inviteId}/reject`
	)
}

export async function deleteFriend(friendId: string) {
	return await useApi<ApiResponse<DeleteFriendResponse>>('DELETE', `/api/friends/${friendId}`)
}

export async function searchFriends(query: string) {
	const params = new URLSearchParams({ query })
	return await useApi<ApiResponse<FriendsListResponse>>(
		'GET',
		`/api/friends/search?${params.toString()}`
	)
}
