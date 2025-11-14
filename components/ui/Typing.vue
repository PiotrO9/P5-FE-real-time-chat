<script setup lang="ts">
interface Props {
	typingText: string
}

const { typingText } = defineProps<Props>()
</script>

<template>
	<div class="px-4 md:px-6 py-2 bg-gray-50 border-t border-gray-200">
		<div class="flex items-center gap-3">
			<div
				class="inline-flex items-center gap-1.5 bg-white rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-gray-200"
			>
				<div class="flex items-center gap-1 px-1">
					<span
						class="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"
						style="animation-delay: 0ms"
					></span>
					<span
						class="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"
						style="animation-delay: 150ms"
					></span>
					<span
						class="w-1.5 h-1.5 bg-gray-500 rounded-full typing-dot"
						style="animation-delay: 300ms"
					></span>
				</div>
				<span class="text-sm text-gray-600 font-medium">{{ typingText }}</span>
			</div>
		</div>
	</div>
</template>
