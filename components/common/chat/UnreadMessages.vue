<script setup lang="ts">
type Variant = 'simple' | 'counter'

interface Props {
	unreadCount: number
	hasUnread: boolean
	variant?: Variant
}

const { unreadCount, hasUnread, variant = 'counter' } = defineProps<Props>()

const isOver99 = computed(() => unreadCount > 99)
const badgeClasses = computed(() => {
	const base =
		'inline-flex items-center justify-center font-semibold bg-blue-600 text-white rounded-full size-7 px-2'
	return isOver99.value ? `${base} text-[10px]` : `${base} text-xs`
})
</script>

<template>
	<div v-if="variant == 'counter'">
		<span v-if="hasUnread" :class="`${badgeClasses} flex-shrink-0`">
			{{ unreadCount > 99 ? '99+' : unreadCount }}
		</span>
		<span v-else class="size-7 flex-shrink-0" aria-hidden="true"></span>
	</div>
	<div v-else>
		<div v-if="hasUnread" class="size-2 bg-blue-500 rounded-full"></div>
	</div>
</template>
