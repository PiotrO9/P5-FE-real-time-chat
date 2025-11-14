import type { Message, SystemMessageType } from '~/types/Chat'
import { toNumber } from '~/utils/typeHelpers'

export function useMessageHelpers() {
	function mapMessageFromBackend(messageData: any): Message {
		if (!messageData) {
			throw new Error('messageData is undefined or null')
		}

		const id = toNumber(messageData.id)
		const chatId = String(messageData.chatId)
		const senderId = toNumber(messageData.senderId)

		return {
			id,
			chatId,
			senderId,
			senderUsername: messageData.senderUsername,
			content: messageData.content,
			createdAt:
				typeof messageData.createdAt === 'string'
					? messageData.createdAt
					: messageData.createdAt.toISOString(),
			reactions: messageData.reactions?.map((r: any) => ({
				emoji: r.emoji,
				userIds: r.userIds.map((uid: any) => toNumber(uid)),
				username: r.username || ''
			})),
			isPinned: messageData.isPinned ?? false,
			pinnedBy: messageData.pinnedBy
				? {
						id: messageData.pinnedBy.id || messageData.pinnedBy.userId,
						username: messageData.pinnedBy.username || ''
					}
				: undefined,
			pinnedAt: messageData.pinnedAt
				? typeof messageData.pinnedAt === 'string'
					? messageData.pinnedAt
					: messageData.pinnedAt.toISOString()
				: undefined,
			edited: messageData.edited ?? false,
			editedAt: messageData.editedAt
				? typeof messageData.editedAt === 'string'
					? messageData.editedAt
					: messageData.editedAt.toISOString()
				: undefined
		}
	}

	function createSystemMessage(
		chatId: string,
		systemType: SystemMessageType,
		systemData: {
			userId?: string | number
			username?: string
			chatId?: string
			updates?: any
		}
	): Message {
		const timestamp = Date.now()
		const stringChatId = String(chatId)
		return {
			id: -timestamp,
			chatId: stringChatId,
			senderId: 0,
			senderUsername: 'System',
			content: '',
			createdAt: new Date().toISOString(),
			isSystem: true,
			systemType,
			systemData
		}
	}

	return {
		mapMessageFromBackend,
		createSystemMessage
	}
}
