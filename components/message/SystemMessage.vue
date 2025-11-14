<script setup lang="ts">
import type { Message, SystemMessageType } from '~/types/Chat'

interface Props {
	message: Message
}

const props = defineProps<Props>()

const message = computed(() => props.message)
const systemType = computed(() => message.value.systemType as SystemMessageType)
const systemData = computed(() => message.value.systemData)
const systemText = computed(() => getSystemMessageText())

function getSystemMessageText(): string {
	if (!systemType.value || !systemData.value) return ''

	const username = systemData.value.username || 'Unknown user'

	switch (systemType.value) {
		case 'member:added':
			return `${username} joined the chat`
		case 'member:removed':
			return `${username} left the chat`
		case 'chat:created':
			return 'Chat was created'
		case 'chat:updated':
			return 'Chat was updated'
		default:
			return ''
	}
}
</script>

<template>
	<div v-if="message.isSystem" class="w-full flex items-center justify-center py-2">
		<div class="px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200">
			<p class="text-xs font-medium text-gray-600 text-center">
				{{ systemText }}
			</p>
		</div>
	</div>
</template>
