import type { Friend } from '~/types/Chat'
import type { FriendResponse } from '~/types/FriendsApi'
import {
	fetchFriends as fetchFriendsFromService,
	sendFriendInvite,
	deleteFriend as deleteFriendFromService
} from '~/services/friendsService'
import { getErrorMessage } from '~/utils/errorHelpers'
import { findById } from '~/utils/idHelpers'
import { useToast } from './useToast'

export function useFriends() {
	const { error: toastError, success: toastSuccess } = useToast()

	const friends = ref<Friend[]>([])
	const friendsLoading = ref(false)
	const friendsError = ref<string | null>(null)

	function mapFriendResponse(friend: FriendResponse): Friend {
		return {
			id: friend.id,
			username: friend.username,
			email: friend.email,
			isOnline: friend.isOnline,
			lastSeen: friend.lastSeen,
			friendshipCreatedAt: friend.friendshipCreatedAt,
			createdAt: friend.createdAt
		}
	}

	async function fetchFriends() {
		try {
			friendsLoading.value = true
			friendsError.value = null

			const res = await fetchFriendsFromService()
			const raw = res?.data
			const friendsList: FriendResponse[] = Array.isArray(raw?.friends) ? raw.friends : []

			friends.value = friendsList.map(mapFriendResponse)
		} catch (err: any) {
			friendsError.value = getErrorMessage(err, 'Failed to fetch friends list')

			if (friendsError.value) {
				toastError(friendsError.value)
			}
		} finally {
			friendsLoading.value = false
		}
	}

	async function addFriend(username: string) {
		if (!username.trim()) {
			toastError('Please provide a username')
			return
		}

		try {
			await sendFriendInvite(username.trim())
			toastSuccess(`Invitation sent to ${username}`)
		} catch (err: any) {
			const errorMessage = getErrorMessage(err, 'Failed to send invitation')
			toastError(errorMessage)
		}
	}

	async function removeFriend(friendId: string | number) {
		const friend = findById(friends.value, friendId)
		if (!friend) return

		try {
			await deleteFriendFromService(String(friendId))
			toastSuccess(`${friend.username} has been removed from friends`)
			await fetchFriends()
		} catch (err: any) {
			const errorMessage = getErrorMessage(err, 'Failed to remove friend')
			toastError(errorMessage)
		}
	}

	function updateFriendStatus(userId: string | number, isOnline: boolean, lastSeen?: Date) {
		const friend = findById(friends.value, userId)
		if (friend) {
			friend.isOnline = isOnline
			if (lastSeen) {
				friend.lastSeen = lastSeen.toISOString()
			}
		}
	}

	function findFriendById(friendId: string | number): Friend | undefined {
		return findById(friends.value, friendId)
	}

	return {
		friends,
		friendsLoading,
		friendsError,
		fetchFriends,
		addFriend,
		removeFriend,
		updateFriendStatus,
		findFriendById
	}
}
