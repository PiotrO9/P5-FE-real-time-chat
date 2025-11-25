<script setup lang="ts">
const { user } = useAuth()

const userInitials = computed(() => {
	if (!user.value?.username) return '?'
	const names = user.value.username.split(' ')

	if (names.length >= 2) {
		return (names[0]?.charAt(0) + names[1]?.charAt(0)).toUpperCase()
	}

	return user.value.username[0].toUpperCase()
})

const showDropdown = ref(false)

function handleToggleDropdown() {
	showDropdown.value = !showDropdown.value
}

function handleLogout() {
	const { logout } = useAuth()
	logout()
	showDropdown.value = false

	navigateTo('/')
}

function handleClickOutside(event: MouseEvent) {
	const target = event.target as HTMLElement
	if (!target.closest('.profile-dropdown')) {
		showDropdown.value = false
	}
}

onMounted(() => {
	document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
	document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
	<header
		class="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-4 md:px-6 z-10"
	>
		<div class="relative profile-dropdown">
			<button
				type="button"
				tabindex="0"
				aria-label="Profile menu"
				aria-expanded="showDropdown"
				class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
				@click="handleToggleDropdown"
				@keydown.enter="handleToggleDropdown"
				@keydown.space.prevent="handleToggleDropdown"
			>
				<div
					class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm"
				>
					{{ userInitials }}
				</div>
				<span class="hidden md:inline text-sm font-medium text-gray-900">{{
					user?.username
				}}</span>
				<svg
					class="w-4 h-4 text-gray-600 transition-transform"
					:class="{ 'rotate-180': showDropdown }"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M19 9l-7 7-7-7"
					/>
				</svg>
			</button>

			<div
				v-if="showDropdown"
				class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
			>
				<button
					type="button"
					tabindex="0"
					aria-label="Logout"
					class="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
					@click="handleLogout"
					@keydown.enter="handleLogout"
					@keydown.space.prevent="handleLogout"
				>
					Logout
				</button>
			</div>
		</div>
	</header>
</template>
