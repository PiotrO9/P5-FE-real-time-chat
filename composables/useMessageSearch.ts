import type { Message } from '~/types/Chat'
import { searchMessages as searchMessagesFromService } from '~/services/chatService'
import { getErrorMessage } from '~/utils/errorHelpers'
import { useToast } from './useToast'
import { useMessageHelpers } from './useMessageHelpers'

export function useMessageSearch() {
	const { error: toastError } = useToast()
	const { mapMessageFromBackend } = useMessageHelpers()

	const searchResults = ref<Message[]>([])
	const searchLoading = ref(false)
	const searchError = ref<string | null>(null)
	const searchQuery = ref('')
	const searchTotal = ref(0)
	const searchHasMore = ref(false)
	const searchOffset = ref(0)
	const searchLimit = ref(20)

	async function searchMessages(chatId: string, query: string, reset: boolean = true) {
		if (!query.trim()) {
			searchResults.value = []
			searchTotal.value = 0
			searchHasMore.value = false
			return
		}

		try {
			searchLoading.value = true
			searchError.value = null

			if (reset) {
				searchOffset.value = 0
			}

			const res = await searchMessagesFromService(
				chatId,
				query,
				searchLimit.value,
				searchOffset.value
			)

			const raw = res?.data
			const items: any[] = Array.isArray(raw?.messages) ? raw.messages : []

			const mappedMessages = items.map((item) => mapMessageFromBackend(item))

			if (reset) {
				searchResults.value = mappedMessages
			} else {
				searchResults.value = [...searchResults.value, ...mappedMessages]
			}

			searchTotal.value = raw?.total ?? 0
			searchHasMore.value = raw?.hasMore ?? false
			searchOffset.value = searchResults.value.length
		} catch (err: any) {
			searchError.value = getErrorMessage(err, 'Failed to search messages')
			toastError(searchError.value || 'Error')
		} finally {
			searchLoading.value = false
		}
	}

	function loadMoreResults(chatId: string) {
		if (!searchHasMore.value || searchLoading.value || !searchQuery.value.trim()) return
		searchMessages(chatId, searchQuery.value, false)
	}

	function clearSearch() {
		searchQuery.value = ''
		searchResults.value = []
		searchTotal.value = 0
		searchHasMore.value = false
		searchOffset.value = 0
		searchError.value = null
	}

	return {
		searchResults,
		searchLoading,
		searchError,
		searchQuery,
		searchTotal,
		searchHasMore,
		searchMessages,
		loadMoreResults,
		clearSearch
	}
}
