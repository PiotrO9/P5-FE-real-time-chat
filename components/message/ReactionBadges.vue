<script setup lang="ts">
interface GroupedReaction {
	userIds: (string | number)[]
	reactions: any[]
}

interface Props {
	groupedReactions: Record<string, GroupedReaction>
	hasUserReaction: (emoji: string) => boolean
	getReactionCount: (emoji: string) => number
	alignment: 'left' | 'right'
}

interface Emits {
	(e: 'reaction-click', emoji: string, event: Event): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

function handleReactionBadgeClick(emoji: string, event: Event) {
	event.stopPropagation()
	emit('reaction-click', emoji, event)
}

function handleReactionBadgeKeyDown(event: KeyboardEvent, emoji: string) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		event.stopPropagation()
		emit('reaction-click', emoji, event)
	}
}
</script>

<template>
	<div
		v-if="Object.keys(groupedReactions).length > 0"
		class="flex flex-wrap gap-1 mt-1 px-1"
		:class="alignment === 'right' ? 'justify-end' : ''"
	>
		<button
			v-for="(reactionGroup, emoji) in groupedReactions"
			:key="emoji"
			type="button"
			tabindex="0"
			:aria-label="`${getReactionCount(emoji)} reactions ${emoji}, click to ${hasUserReaction(emoji) ? 'remove' : 'add'} reaction`"
			class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
			:class="{
				'bg-blue-100 border-blue-300': hasUserReaction(emoji)
			}"
			@click="handleReactionBadgeClick(emoji, $event)"
			@keydown="handleReactionBadgeKeyDown($event, emoji)"
		>
			<span>{{ emoji }}</span>
			<span class="font-medium text-gray-700">{{ getReactionCount(emoji) }}</span>
		</button>
	</div>
</template>
