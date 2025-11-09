<script setup lang="ts">
import type { Message, SystemMessageType } from '~/types/Chat'

interface Props {
	message: Message
}

const props = defineProps<Props>()

const message = computed(() => props.message)
const systemType = computed(() => message.value.systemType as SystemMessageType)
const systemData = computed(() => message.value.systemData)

function getSystemMessageText(): string {
	if (!systemType.value || !systemData.value) return ''

	const username = systemData.value.username || 'Nieznany użytkownik'

	switch (systemType.value) {
		case 'member:added':
			return `${username} dołączył do czatu`
		case 'member:removed':
			return `${username} opuścił czat`
		case 'chat:created':
			return 'Czat został utworzony'
		case 'chat:updated':
			return 'Czat został zaktualizowany'
		default:
			return ''
	}
}

const systemText = computed(() => getSystemMessageText())
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
