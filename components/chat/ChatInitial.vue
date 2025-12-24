<script setup lang="ts">
interface Props {
	chatInitial: string
	isOnline?: boolean
	chatId?: string | number
}

const props = defineProps<Props>()

type AvatarColor = 'green' | 'purple' | 'teal' | 'blue' | 'pink' | 'orange'

function getAvatarColor(chatId?: string | number, initial?: string): AvatarColor {
	if (!chatId && !initial) return 'blue'

	const hash = chatId
		? String(chatId)
				.split('')
				.reduce((acc, char) => acc + char.charCodeAt(0), 0)
		: initial?.charCodeAt(0) || 0

	const colors: AvatarColor[] = ['green', 'purple', 'teal', 'blue', 'pink', 'orange']
	return colors[hash % colors.length] as AvatarColor
}

const avatarColor = computed(() => getAvatarColor(props.chatId, props.chatInitial))

const avatarClasses = computed(() => {
	const colorMap: Record<AvatarColor, string> = {
		green: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
		purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
		teal: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400',
		blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
		pink: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
		orange: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
	}

	const color: AvatarColor = avatarColor.value || 'blue'
	return `size-10 ${colorMap[color]} flex items-center justify-center font-bold rounded-full`
})
</script>

<template>
	<div class="relative">
		<div :class="avatarClasses">
			{{ chatInitial }}
		</div>
		<div
			v-if="isOnline"
			class="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full z-10"
			aria-label="Online"
		></div>
	</div>
</template>
