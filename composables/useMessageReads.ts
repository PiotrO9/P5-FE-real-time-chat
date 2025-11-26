import type { Chat, Message, MessageReadItem } from '~/types/Chat'
import { compareIds, findById, findIndexById } from '~/utils/idHelpers'
export function useMessageReads(chats: Ref<Chat[]>) {
	function addReadToMessage(
		chatId: string,
		messageId: string | number,
		reader: { userId: number | string; username: string; readAt: string }
	) {
		const chat = findById(chats.value, chatId)
		if (!chat) return

		const messageIndex = findIndexById(chat.messages, messageId)
		if (messageIndex === -1) return

		const message = chat.messages[messageIndex]
		if (!message) return

		if (!message.reads) {
			message.reads = []
		}

		const existingReadIndex = message.reads.findIndex((read) =>
			compareIds(read.userId, reader.userId)
		)

		if (existingReadIndex !== -1) {
			message.reads[existingReadIndex] = {
				userId: reader.userId,
				username: reader.username,
				readAt: reader.readAt
			}
		} else {
			message.reads.push({
				userId: reader.userId,
				username: reader.username,
				readAt: reader.readAt
			})
		}
	}

	function removeReadFromMessage(
		chatId: string,
		messageId: string | number,
		userId: number | string
	) {
		const chat = findById(chats.value, chatId)
		if (!chat) return

		const messageIndex = findIndexById(chat.messages, messageId)
		if (messageIndex === -1) return

		const message = chat.messages[messageIndex]
		if (!message || !message.reads) return

		message.reads = message.reads.filter((read) => !compareIds(read.userId, userId))
	}

	function getMessageReads(message: Message): MessageReadItem[] {
		return message.reads || []
	}

	function getMessageReadsCount(message: Message): number {
		return message.reads?.length || 0
	}

	function hasUserReadMessage(message: Message, userId: number | string): boolean {
		if (!message.reads) return false
		return message.reads.some((read) => compareIds(read.userId, userId))
	}

	return {
		addReadToMessage,
		removeReadFromMessage,
		getMessageReads,
		getMessageReadsCount,
		hasUserReadMessage
	}
}
