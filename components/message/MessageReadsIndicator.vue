<script setup lang="ts">
import type { MessageReadItem } from '~/types/Chat'
import { useMessageHelpers } from '~/composables/useMessageHelpers'

interface Props {
	reads: MessageReadItem[]
	maxVisible?: number
}

const props = withDefaults(defineProps<Props>(), {
	maxVisible: 3
})

const { formatMessageTime } = useMessageHelpers()

const visibleReads = computed(() => {
	return props.reads.slice(0, props.maxVisible)
})

const hiddenReadsCount = computed(() => {
	return Math.max(0, props.reads.length - props.maxVisible)
})

const showTooltip = ref(false)
const tooltipRef = ref<HTMLDivElement | null>(null)
const hoveredRead = ref<MessageReadItem | null>(null)

function formatReadDateTime(readAt: string): string {
	const date = new Date(readAt)
	const now = new Date()
	const isToday = date.toDateString() === now.toDateString()
	const isYesterday =
		date.toDateString() === new Date(now.getTime() - 24 * 60 * 60 * 1000).toDateString()

	if (isToday) {
		return `today at ${formatMessageTime(readAt)}`
	}

	if (isYesterday) {
		return `yesterday at ${formatMessageTime(readAt)}`
	}

	return date.toLocaleString('en-US', {
		day: 'numeric',
		month: 'short',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
		hour: '2-digit',
		minute: '2-digit'
	})
}

function handleReadMouseEnter(read: MessageReadItem) {
	hoveredRead.value = read
	showTooltip.value = true
}

function handleReadMouseLeave() {
	showTooltip.value = false
	setTimeout(() => {
		if (!tooltipRef.value?.matches(':hover')) {
			hoveredRead.value = null
		}
	}, 100)
}

function handleTooltipMouseEnter() {
	showTooltip.value = true
}

function handleTooltipMouseLeave() {
	showTooltip.value = false
	hoveredRead.value = null
}

function handleMoreMouseEnter() {
	showTooltip.value = true
	hoveredRead.value = null
}

function handleMoreMouseLeave() {
	showTooltip.value = false
	setTimeout(() => {
		if (!tooltipRef.value?.matches(':hover')) {
			hoveredRead.value = null
		}
	}, 100)
}

const tooltipContent = computed(() => {
	if (hoveredRead.value) {
		const dateTime = formatReadDateTime(hoveredRead.value.readAt)
		return {
			username: hoveredRead.value.username,
			dateTime,
			isSingle: true
		}
	}

	if (hiddenReadsCount.value > 0) {
		const hiddenReads = props.reads.slice(props.maxVisible)
		return {
			reads: hiddenReads.map((read) => ({
				username: read.username,
				dateTime: formatReadDateTime(read.readAt)
			})),
			isSingle: false
		}
	}

	return null
})

const hasReads = computed(() => props.reads.length > 0)
</script>

<template>
	<div v-if="hasReads" class="relative flex items-center gap-1 mt-1">
		<div
			v-for="(read, index) in visibleReads"
			:key="read.userId"
			class="w-4 h-4 rounded-full bg-blue-500 border border-white flex items-center justify-center text-[8px] text-white font-medium cursor-help transition-transform hover:scale-110"
			:class="index > 0 ? '-ml-1' : ''"
			:aria-label="`Read by ${read.username} ${formatReadDateTime(read.readAt)}`"
			@mouseenter="handleReadMouseEnter(read)"
			@mouseleave="handleReadMouseLeave"
		>
			{{ read.username.charAt(0).toUpperCase() }}
		</div>
		<div
			v-if="hiddenReadsCount > 0"
			class="w-4 h-4 rounded-full bg-gray-400 border border-white flex items-center justify-center text-[8px] text-white font-medium -ml-1 cursor-help transition-transform hover:scale-110"
			:aria-label="`And ${hiddenReadsCount} more`"
			@mouseenter="handleMoreMouseEnter"
			@mouseleave="handleMoreMouseLeave"
		>
			+{{ hiddenReadsCount }}
		</div>

		<Transition
			enter-active-class="transition-opacity duration-200"
			enter-from-class="opacity-0"
			enter-to-class="opacity-100"
			leave-active-class="transition-opacity duration-200"
			leave-from-class="opacity-100"
			leave-to-class="opacity-0"
		>
			<div
				v-if="showTooltip && tooltipContent"
				ref="tooltipRef"
				class="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl z-50 min-w-[200px] max-w-[280px]"
				@mouseenter="handleTooltipMouseEnter"
				@mouseleave="handleTooltipMouseLeave"
			>
				<div v-if="tooltipContent.isSingle" class="flex flex-col gap-1">
					<div class="font-semibold">{{ tooltipContent.username }}</div>
					<div class="text-gray-300 text-[11px]">Read {{ tooltipContent.dateTime }}</div>
				</div>

				<div v-else-if="tooltipContent.reads" class="flex flex-col gap-2">
					<div class="font-semibold mb-1">
						Read by {{ tooltipContent.reads.length }} more
					</div>
					<div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
						<div
							v-for="(read, index) in tooltipContent.reads"
							:key="index"
							class="flex flex-col gap-0.5 pb-1.5 border-b border-gray-700 last:border-0 last:pb-0"
						>
							<div class="font-medium text-[11px]">{{ read.username }}</div>
							<div class="text-gray-400 text-[10px]">{{ read.dateTime }}</div>
						</div>
					</div>
				</div>

				<div
					class="absolute top-full right-4 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
				></div>
			</div>
		</Transition>
	</div>
</template>
