import type { Message } from '~/types/Chat'

export function useMessageOwnership(message: Ref<Message>, currentUserId: Ref<string | number>) {
	const isOwnMessage = computed(() => {
		return String(message.value.senderId) === String(currentUserId.value)
	})

	const senderDisplayName = computed(() => {
		if (isOwnMessage.value) return 'You'
		return message.value.senderUsername || 'Unknown'
	})

	return {
		isOwnMessage,
		senderDisplayName
	}
}
