<script setup lang="ts">
interface Props {
	isLoading: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'load-more'): void }>()

const isLoadingMore = computed(() => props.isLoading)

const buttonText = computed(() => (isLoadingMore.value ? 'Ładowanie...' : 'Załaduj starsze'))

const ariaLabel = computed(() =>
	isLoadingMore.value ? 'Ładowanie starszych wiadomości' : 'Załaduj starsze wiadomości'
)

function handleClick() {
	emit('load-more')
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	emit('load-more')
}
</script>

<template>
	<div class="flex justify-center">
		<button
			type="button"
			class="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
			:aria-label="ariaLabel"
			:tabindex="0"
			:disabled="isLoadingMore"
			@click="handleClick"
			@keydown="handleKeyDown"
		>
			{{ buttonText }}
		</button>
	</div>
</template>
