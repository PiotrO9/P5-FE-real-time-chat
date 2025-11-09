import type { Invite } from '~/types/FriendsApi'
import {
	fetchInvites as fetchInvitesFromService,
	acceptInvite,
	rejectInvite
} from '~/services/friendsService'
import { getErrorMessage } from '~/utils/errorHelpers'
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

	return {
		invites,
		invitesLoading,
		invitesError,
		fetchInvites,
		acceptInvite: acceptInviteHandler,
		rejectInvite: rejectInviteHandler
	}
}
