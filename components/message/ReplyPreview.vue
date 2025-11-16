<script setup lang="ts">
interface ReplyTo {
	id?: string | number
	content?: string
	senderUsername?: string
}

interface Props {
	replyTo: ReplyTo
	isOwnMessage: boolean
	replyToSenderName: string
	variant?: 'own' | 'other'
}

interface Emits {
	(e: 'click', event: Event): void
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'other'
})

const emit = defineEmits<Emits>()

function handleClick(event: Event) {
	event.stopPropagation()
	emit('click', event)
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleClick(event)
	}
}

const replyText = computed(() => {
	if (props.isOwnMessage) {
		return 'Odpowiedziałeś'
	}
	return 'Answered by'
})
</script>

<template>
	<button
		type="button"
		tabindex="0"
		aria-label="Przejdź do oryginalnej wiadomości"
		class="flex flex-col gap-0.5 bg-gray-300 rounded-lg p-2 text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 cursor-pointer"
		:class="isOwnMessage ? 'items-end' : 'items-start'"
		@click="handleClick"
		@keydown="handleKeyDown"
	>
		<div class="flex items-center gap-1.5">
			<span class="text-[11px] text-gray-500">
				{{ replyText }}
			</span>
			<span class="text-[11px] font-medium text-gray-600">
				{{ replyToSenderName }}
			</span>
		</div>
		<p
			v-if="replyTo.content"
			class="text-[11px] text-gray-500 line-clamp-1 max-w-full break-words"
			:class="isOwnMessage ? 'text-right' : 'text-left'"
		>
			{{ replyTo.content }}
		</p>
	</button>
</template>
