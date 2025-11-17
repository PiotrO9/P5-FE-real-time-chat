import type { Message } from '~/types/Chat'
import { updateMessage as updateMessageService } from '~/services/chatService'
import { useMessageHelpers } from './useMessageHelpers'
import { useToast } from './useToast'

export function useMessageEdit(message: Ref<Message>, onSuccess?: () => void) {
	const isEditing = ref(false)
	const editContent = ref('')
	const isUpdating = ref(false)
	const editTextareaRef = ref<HTMLTextAreaElement | null>(null)
	const { error: toastError } = useToast()

	function startEdit() {
		if (isEditing.value) return
		isEditing.value = true
		editContent.value = message.value.content
		nextTick(() => {
			editTextareaRef.value?.focus()
			editTextareaRef.value?.select()
		})
	}

	function cancelEdit() {
		if (isUpdating.value) return
		isEditing.value = false
		editContent.value = ''
	}

	async function saveEdit() {
		if (
			isUpdating.value ||
			!editContent.value.trim() ||
			editContent.value.trim() === message.value.content
		) {
			cancelEdit()
			return
		}

		try {
			isUpdating.value = true
			const res = await updateMessageService(message.value.id, editContent.value.trim())
			const { mapMessageFromBackend } = useMessageHelpers()

			if (res?.data) {
				const updatedMessage = mapMessageFromBackend(res.data)
				message.value.content = updatedMessage.content
				message.value.edited = updatedMessage.edited ?? true
				message.value.editedAt = updatedMessage.editedAt
			}

			isEditing.value = false
			editContent.value = ''
			onSuccess?.()
		} catch (error: any) {
			const errorMessage = error?.response?._data?.message || error?.message
			toastError(errorMessage || 'Failed to update message')
		} finally {
			isUpdating.value = false
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			event.preventDefault()
			cancelEdit()
		} else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
			event.preventDefault()
			saveEdit()
		}
	}

	return {
		isEditing,
		editContent,
		isUpdating,
		editTextareaRef,
		startEdit,
		cancelEdit,
		saveEdit,
		handleKeyDown
	}
}
