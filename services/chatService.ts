import type { ApiResponse } from '~/types/Api'
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

export async function sendMessage(chatId: string, content: string) {
	return await useApi<ApiResponse<Message>>('POST', `/api/messages/${chatId}/messages`, {
		content
	})
}

export async function deleteMessage(messageId: string | number) {
	return await useApi<ApiResponse<void>>('DELETE', `/api/messages/${messageId}`)
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
