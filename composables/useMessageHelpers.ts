import type { Message, SystemMessageType } from '~/types/Chat'
import { toNumber } from '~/utils/typeHelpers'

export function useMessageHelpers() {
	function mapMessageFromBackend(messageData: any): Message {
		if (!messageData) {
			throw new Error('messageData is undefined or null')
		}

		// Obsługuj zarówno UUID (string) jak i liczby
		const id =
			typeof messageData.id === 'string' && isNaN(Number(messageData.id))
				? messageData.id
				: toNumber(messageData.id)
		const chatId = String(messageData.chatId)
		const senderId =
			typeof messageData.senderId === 'string' && isNaN(Number(messageData.senderId))
				? messageData.senderId
				: toNumber(messageData.senderId)

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
				: undefined,
			replyTo: messageData.replyTo
				? {
						id:
							typeof messageData.replyTo.id === 'string' &&
							isNaN(Number(messageData.replyTo.id))
								? messageData.replyTo.id
								: toNumber(messageData.replyTo.id),
						content: messageData.replyTo.content || '',
						senderUsername: messageData.replyTo.senderUsername || ''
					}
				: undefined,
			reads: messageData.reads?.map((read: any) => ({
				userId:
					typeof read.userId === 'string' && isNaN(Number(read.userId))
						? read.userId
						: toNumber(read.userId),
				username: read.username || '',
				readAt: typeof read.readAt === 'string' ? read.readAt : read.readAt.toISOString()
			})),
			forwardedFrom: messageData.forwardedFrom
				? {
						messageId: String(messageData.forwardedFrom.messageId),
						chatId: String(messageData.forwardedFrom.chatId),
						chatName: messageData.forwardedFrom.chatName ?? null,
						senderUsername: messageData.forwardedFrom.senderUsername || '',
						originalCreatedAt:
							typeof messageData.forwardedFrom.originalCreatedAt === 'string'
								? messageData.forwardedFrom.originalCreatedAt
								: messageData.forwardedFrom.originalCreatedAt.toISOString()
					}
				: null
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

	function formatMessageTime(createdAt: string): string {
		return new Date(createdAt).toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit'
		})
	}

	function truncateMessage(content: string, maxLength: number = 50): string {
		if (content.length <= maxLength) return content

		return content.substring(0, maxLength) + '...'
	}

	return {
		mapMessageFromBackend,
		createSystemMessage,
		formatMessageTime,
		truncateMessage
	}
}
