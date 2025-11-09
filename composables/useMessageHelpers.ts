import type { Message, SystemMessageType } from '~/types/Chat'
import { toNumber } from '~/utils/typeHelpers'

export function useMessageHelpers() {
	function mapMessageFromBackend(messageData: any): Message {
		const id = toNumber(messageData.id)
		const chatId = toNumber(messageData.chatId)
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
			}))
		}
	}

	function createSystemMessage(
		chatId: number | string,
		systemType: SystemMessageType,
		systemData: {
			userId?: string | number
			username?: string
			chatId?: string | number
			updates?: any
		}
	): Message {
		const timestamp = Date.now()
		const numericChatId = toNumber(chatId)
		return {
			id: -timestamp,
			chatId: numericChatId,
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
