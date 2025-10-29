import type { ApiResponse } from '~/types/Api'
import type { ChatsResponse } from '~/types/ChatsApi'
import type { Message } from '~/types/Chat'
import type { MessagesResponse } from '~/types/MessagesApi'

export async function fetchChats() {
	return await useApi<ApiResponse<ChatsResponse>>('GET', '/api/chats')
}

export async function fetchMessages(chatId: number, limit: number, offset: number) {
    return await useApi<ApiResponse<MessagesResponse>>(
		'GET',
		`/api/messages/${chatId}/messages?limit=${limit}&offset=${offset}`
	)
}

export async function sendMessage(chatId: number, content: string) {
	return await useApi<ApiResponse<Message>>('POST', `/api/messages/${chatId}/messages`, {
		content
	})
}
