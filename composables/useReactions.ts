import type { Chat } from '~/types/Chat'

export function useReactions(
	chats: Ref<Chat[]>,
	selectedChatId: Ref<number | null>,
	currentUserId: Ref<number>,
	user: Ref<any>
) {
	function handleReactionUpdated(
		messageId: string | number,
		emoji: string,
		action: 'add' | 'remove'
	) {
		const chat = chats.value.find((c) => c.id === selectedChatId.value)
		if (!chat) return

		const message = chat.messages.find((m) => String(m.id) === String(messageId))
		if (!message) return

		if (!message.reactions) {
			message.reactions = []
		}

		if (action === 'add') {
			const existingReaction = message.reactions.find((r) => r.emoji === emoji)

			if (existingReaction) {
				if (!existingReaction.userIds.includes(currentUserId.value)) {
					existingReaction.userIds.push(currentUserId.value)
				}
			} else {
				message.reactions.push({
					emoji,
					userIds: [currentUserId.value],
					username: user.value?.username || ''
				})
			}
		} else {
			const existingReaction = message.reactions.find((r) => r.emoji === emoji)

			if (existingReaction) {
				existingReaction.userIds = existingReaction.userIds.filter(
					(id) => String(id) !== String(currentUserId.value)
				)

				if (existingReaction.userIds.length === 0) {
					message.reactions = message.reactions.filter((r) => r.emoji !== emoji)
				}
			}
		}
	}

	function addReactionToMessage(
		chatId: number,
		messageId: string | number,
		emoji: string,
		userId: string | number,
		username: string
	) {
		const chat = chats.value.find((c) => c.id === chatId)
		if (!chat) return

		const message = chat.messages.find((m) => String(m.id) === String(messageId))
		if (!message) return

		if (!message.reactions) {
			message.reactions = []
		}

		const existingReaction = message.reactions.find((r) => r.emoji === emoji)

		if (existingReaction) {
			if (!existingReaction.userIds.some((id) => String(id) === String(userId))) {
				existingReaction.userIds.push(userId)
			}
		} else {
			message.reactions.push({
				emoji,
				userIds: [userId],
				username
			})
		}
	}

	function removeReactionFromMessage(
		chatId: number,
		messageId: string | number,
		emoji: string,
		userId: string | number
	) {
		const chat = chats.value.find((c) => c.id === chatId)
		if (!chat) return

		const message = chat.messages.find((m) => String(m.id) === String(messageId))
		if (!message || !message.reactions) return

		const existingReaction = message.reactions.find((r) => r.emoji === emoji)

		if (existingReaction) {
			existingReaction.userIds = existingReaction.userIds.filter(
				(id) => String(id) !== String(userId)
			)

			if (existingReaction.userIds.length === 0) {
				message.reactions = message.reactions.filter((r) => r.emoji !== emoji)
			}
		}
	}

	return {
		handleReactionUpdated,
		addReactionToMessage,
		removeReactionFromMessage
	}
}
