<script setup lang="ts">
interface Props {
	open: boolean
	title?: string
	message?: string
	confirmText?: string
	cancelText?: string
}

interface Emits {
	(e: 'update:open', value: boolean): void
	(e: 'confirm'): void
	(e: 'cancel'): void
}

const props = withDefaults(defineProps<Props>(), {
	title: '',
	message: '',
	confirmText: 'Confirm',
	cancelText: 'Cancel'
})

const emit = defineEmits<Emits>()
const slots = useSlots()

const dialogRef = ref<HTMLDialogElement | null>(null)

const hasHeaderSlot = computed(() => !!slots.header)
const hasDefaultSlot = computed(() => !!slots.default)
const hasFooterSlot = computed(() => !!slots.footer)

watch(
	() => props.open,
	(newValue) => {
		if (!dialogRef.value) return

		if (newValue) {
			nextTick(() => {
				if (dialogRef.value) {
					dialogRef.value.showModal()
				}
			})
		} else {
			dialogRef.value.close()
		}
	},
	{ immediate: true }
)

function handleConfirm() {
	emit('confirm')
	emit('update:open', false)
}

function handleCancel() {
	emit('cancel')
	emit('update:open', false)
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		event.preventDefault()
		handleCancel()
	}
}

function handleBackdropClick(event: MouseEvent) {
	if (!dialogRef.value) return

	if (event.target === dialogRef.value) {
		handleCancel()
	}
}

onMounted(() => {
	if (props.open && dialogRef.value) {
		dialogRef.value.showModal()
	}
})
</script>

<template>
	<Teleport to="body">
		<dialog
			v-show="open"
			ref="dialogRef"
			class="dialog-content backdrop:bg-black backdrop:bg-opacity-50 backdrop:backdrop-blur-sm rounded-xl border-0 p-0 max-w-md w-full bg-white dark:bg-gray-800 shadow-2xl"
			:aria-labelledby="hasHeaderSlot || title ? 'dialog-title' : undefined"
			:aria-describedby="hasDefaultSlot || message ? 'dialog-message' : undefined"
			@keydown="handleKeyDown"
			@click="handleBackdropClick"
		>
			<div class="p-6">
				<header v-if="hasHeaderSlot" class="mb-3">
					<slot name="header" />
				</header>

				<h2
					v-else-if="title"
					id="dialog-title"
					class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3"
				>
					{{ title }}
				</h2>

				<div v-if="hasDefaultSlot" class="mb-6">
					<slot />
				</div>

				<p v-else-if="message" id="dialog-message" class="text-gray-600 dark:text-gray-400 mb-6">
					{{ message }}
				</p>

				<footer v-if="hasFooterSlot">
					<slot name="footer" />
				</footer>

				<div v-else class="flex justify-end gap-3">
					<button
						type="button"
						tabindex="0"
						class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors duration-150"
						:aria-label="cancelText"
						@click="handleCancel"
						@keydown="(e) => e.key === 'Enter' && handleCancel()"
					>
						{{ cancelText }}
					</button>
					<button
						type="button"
						tabindex="0"
						class="px-4 py-2 text-sm font-medium text-white bg-red-600 dark:bg-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 transition-colors duration-150"
						:aria-label="confirmText"
						@click="handleConfirm"
						@keydown="(e) => e.key === 'Enter' && handleConfirm()"
					>
						{{ confirmText }}
					</button>
				</div>
			</div>
		</dialog>
	</Teleport>
</template>

<style scoped>
.dialog-content {
	animation: dialog-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

.dialog-content[open] {
	animation: dialog-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes dialog-enter {
	from {
		opacity: 0;
		transform: scale(0.9) translateY(-10px);
	}
	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}

.dialog-content::backdrop {
	animation: backdrop-enter 0.2s ease-out forwards;
}

@keyframes backdrop-enter {
	from {
		opacity: 0;
		backdrop-filter: blur(0);
	}
	to {
		opacity: 1;
		backdrop-filter: blur(4px);
	}
}
</style>
