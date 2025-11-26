import type { Invite } from '~/types/FriendsApi'
import type { User } from '~/types/Chat'
import type { FriendInviteReceivedEvent, FriendInviteRejectedEvent } from '~/types/socket'
import {
	fetchInvites as fetchInvitesFromService,
	acceptInvite,
	rejectInvite
} from '~/services/friendsService'
import { getErrorMessage } from '~/utils/errorHelpers'
import { findIndexById, compareIds } from '~/utils/idHelpers'
import { useToast } from './useToast'

export function useInvites() {
	const { error: toastError, success: toastSuccess } = useToast()

	const invites = ref<{
		sentInvites: Invite[]
		receivedInvites: Invite[]
		totalSent: number
		totalReceived: number
		totalPending: number
	}>({
		sentInvites: [],
		receivedInvites: [],
		totalSent: 0,
		totalReceived: 0,
		totalPending: 0
	})
	const invitesLoading = ref(false)
	const invitesError = ref<string | null>(null)

	async function fetchInvites() {
		try {
			invitesLoading.value = true
			invitesError.value = null

			const res = await fetchInvitesFromService()
			const raw = res?.data

			invites.value = {
				sentInvites: Array.isArray(raw?.sentInvites) ? raw.sentInvites : [],
				receivedInvites: Array.isArray(raw?.receivedInvites) ? raw.receivedInvites : [],
				totalSent: raw?.totalSent ?? 0,
				totalReceived: raw?.totalReceived ?? 0,
				totalPending: raw?.totalPending ?? 0
			}
		} catch (err: any) {
			invitesError.value = getErrorMessage(err, 'Failed to fetch invitations')

			if (invitesError.value) {
				toastError(invitesError.value)
			}
		} finally {
			invitesLoading.value = false
		}
	}

	async function acceptInviteHandler(inviteId: string) {
		try {
			await acceptInvite(inviteId)
			toastSuccess('Invitation has been accepted')
		} catch (err: any) {
			const errorMessage = getErrorMessage(err, 'Failed to accept invitation')
			toastError(errorMessage)
		}
	}

	async function rejectInviteHandler(inviteId: string) {
		try {
			await rejectInvite(inviteId)
			toastSuccess('Invitation has been rejected')
		} catch (err: any) {
			const errorMessage = getErrorMessage(err, 'Failed to reject invitation')
			toastError(errorMessage)
		}
	}

	function mapUserToInviteUser(user: User): Invite['sender'] {
		return {
			id: user.id,
			username: user.username,
			email: user.email,
			isOnline: false
		}
	}

	function addReceivedInvite(inviteData: FriendInviteReceivedEvent['invite']) {
		const invite: Invite = {
			id: inviteData.id,
			status: inviteData.status,
			createdAt:
				typeof inviteData.createdAt === 'string'
					? inviteData.createdAt
					: inviteData.createdAt.toISOString(),
			sender: mapUserToInviteUser(inviteData.sender),
			receiver: inviteData.receiver ? mapUserToInviteUser(inviteData.receiver) : undefined
		}

		const existingIndex = findIndexById(invites.value.receivedInvites, invite.id)
		if (existingIndex === -1) {
			invites.value.receivedInvites.push(invite)
			invites.value.totalReceived++
			invites.value.totalPending++
		}
	}

	function removeInvite(inviteId: string) {
		const sentIndex = findIndexById(invites.value.sentInvites, inviteId)
		if (sentIndex !== -1) {
			const invite = invites.value.sentInvites[sentIndex]
			if (invite.status === 'PENDING') {
				invites.value.totalPending--
			}
			invites.value.sentInvites.splice(sentIndex, 1)
			invites.value.totalSent--
			return
		}

		const receivedIndex = findIndexById(invites.value.receivedInvites, inviteId)
		if (receivedIndex !== -1) {
			const invite = invites.value.receivedInvites[receivedIndex]
			if (invite.status === 'PENDING') {
				invites.value.totalPending--
			}
			invites.value.receivedInvites.splice(receivedIndex, 1)
			invites.value.totalReceived--
		}
	}

	function updateInviteStatus(inviteData: FriendInviteRejectedEvent['invite']) {
		const inviteId = inviteData.id
		const sentIndex = findIndexById(invites.value.sentInvites, inviteId)

		if (sentIndex !== -1) {
			const invite = invites.value.sentInvites[sentIndex]
			if (invite.status === 'PENDING') {
				invites.value.totalPending--
			}
			invites.value.sentInvites[sentIndex] = {
				...invite,
				status: inviteData.status,
				receiver: inviteData.receiver ? mapUserToInviteUser(inviteData.receiver) : undefined
			}
			return
		}

		const receivedIndex = findIndexById(invites.value.receivedInvites, inviteId)
		if (receivedIndex !== -1) {
			const invite = invites.value.receivedInvites[receivedIndex]
			if (invite.status === 'PENDING') {
				invites.value.totalPending--
			}
			invites.value.receivedInvites[receivedIndex] = {
				...invite,
				status: inviteData.status,
				sender: inviteData.sender ? mapUserToInviteUser(inviteData.sender) : undefined
			}
		}
	}

	function removeInvitesByUserIds(userId1: string | number, userId2: string | number) {
		const sentToRemove: string[] = []
		const receivedToRemove: string[] = []

		invites.value.sentInvites.forEach((invite) => {
			if (
				(invite.receiver && compareIds(invite.receiver.id, userId1)) ||
				(invite.receiver && compareIds(invite.receiver.id, userId2))
			) {
				sentToRemove.push(invite.id)
			}
		})

		invites.value.receivedInvites.forEach((invite) => {
			if (
				(invite.sender && compareIds(invite.sender.id, userId1)) ||
				(invite.sender && compareIds(invite.sender.id, userId2))
			) {
				receivedToRemove.push(invite.id)
			}
		})

		sentToRemove.forEach((inviteId) => removeInvite(inviteId))
		receivedToRemove.forEach((inviteId) => removeInvite(inviteId))
	}

	return {
		invites,
		invitesLoading,
		invitesError,
		fetchInvites,
		acceptInvite: acceptInviteHandler,
		rejectInvite: rejectInviteHandler,
		addReceivedInvite,
		removeInvite,
		updateInviteStatus,
		removeInvitesByUserIds
	}
}
