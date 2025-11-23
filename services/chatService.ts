import type { ChatsResponse } from '~/types/ChatsApi'
import type { Message } from '~/types/Chat'
import type { MessagesResponse } from '~/types/MessagesApi'

export async function fetchChats() {
	return await useApi<ApiResponse<ChatsResponse>>('GET', '/api/chats')
}

export async function fetchChatDetails(chatId: string | string) {
	return await useApi<ApiResponse<any>>('GET', `/api/chats/${chatId}`)
}

export async function fetchMessages(chatId: string, limit: number, offset: number) {
	return await useApi<ApiResponse<MessagesResponse>>(
		'GET',
		`/api/messages/${chatId}/messages?limit=${limit}&offset=${offset}`
	)
}

export async function sendMessage(chatId: string, content: string, replyToId?: string | number) {
	const body: { content: string; replyToId?: string | number } = { content }
	if (replyToId !== undefined) {
		body.replyToId = replyToId
	}
	return await useApi<ApiResponse<Message>>('POST', `/api/messages/${chatId}/messages`, body)
}

export async function deleteMessage(messageId: string | number) {
	return await useApi<ApiResponse<Message>>('DELETE', `/api/messages/${messageId}`)
}

export async function addReaction(messageId: string | number, emoji: string) {
	return await useApi<ApiResponse<void>>('POST', `/api/messages/${messageId}/reactions`, {
		emoji
	})
}

export async function removeReaction(messageId: string | number, emoji: string) {
	return await useApi<ApiResponse<void>>(
		'DELETE',
		`/api/messages/${messageId}/reactions/${emoji}`
	)
}

export async function addChatMembers(chatId: number | string, userIds: string[]) {
	return await useApi<ApiResponse<void>>('POST', `/api/chats/${chatId}/members`, {
		userIds
	})
}

export async function removeChatMembers(chatId: number | string, userIds: string[]) {
	return await useApi<ApiResponse<void>>('DELETE', `/api/chats/${chatId}/members`, {
		userIds
	})
}

export async function updateChatMemberRole(
	chatId: number | string,
	userId: string,
	role: 'USER' | 'MODERATOR' | 'OWNER'
) {
	return await useApi<ApiResponse<void>>('PATCH', `/api/chats/${chatId}/members/${userId}/role`, {
		role
	})
}

export async function pinMessage(chatId: number | string, messageId: string | number) {
	return await useApi<ApiResponse<Message>>('POST', `/api/chats/${chatId}/pin/${messageId}`)
}

export async function unpinMessage(chatId: number | string, messageId: string | number) {
	return await useApi<ApiResponse<Message>>('DELETE', `/api/chats/${chatId}/unpin/${messageId}`)
}

export async function fetchPinnedMessages(chatId: number | string) {
	return await useApi<ApiResponse<MessagesResponse>>('GET', `/api/chats/${chatId}/pinned`)
}

export async function updateMessage(messageId: string | number, content: string) {
	return await useApi<ApiResponse<Message>>('PATCH', `/api/messages/${messageId}`, {
		content
	})
}

export async function markMessageAsRead(messageId: string | number) {
	return await useApi<ApiResponse<void>>('POST', `/api/messages/${messageId}/read`)
}

export async function fetchMessageReaders(messageId: string | number) {
	return await useApi<ApiResponse<{ userId: string; username: string; readAt: string }[]>>(
		'GET',
		`/api/messages/${messageId}/readers`
	)
}

export async function forwardMessage(targetChatId: string, messageId: string | number) {
	return await useApi<ApiResponse<Message>>('POST', `/api/messages/${targetChatId}/forward`, {
		messageId
	})
}

export async function searchMessages(
	chatId: string,
	query: string,
	limit: number = 20,
	offset: number = 0
) {
	const params = new URLSearchParams({
		query,
		limit: String(limit),
		offset: String(offset)
	})
	return await useApi<ApiResponse<MessagesResponse>>(
		'GET',
		`/api/messages/${chatId}/search?${params.toString()}`
	)
}
