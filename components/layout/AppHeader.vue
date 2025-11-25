<script setup lang="ts">
const { user } = useAuth()
const { isDark, toggleTheme } = useTheme()

const userInitials = computed(() => {
	if (!user.value?.username) return '?'
	const names = user.value.username.split(' ')

	if (names.length >= 2) {
		const first = names[0]?.charAt(0) || ''
		const second = names[1]?.charAt(0) || ''
		return (first + second).toUpperCase()
	}

	return user.value.username[0]?.toUpperCase() || '?'
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

function handleToggleTheme() {
	toggleTheme()
	showDropdown.value = false
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
		class="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-end px-4 md:px-6 z-10"
	>
		<div class="relative profile-dropdown">
			<button
				type="button"
				tabindex="0"
				aria-label="Profile menu"
				:aria-expanded="showDropdown"
				class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
				@click="handleToggleDropdown"
				@keydown.enter="handleToggleDropdown"
				@keydown.space.prevent="handleToggleDropdown"
			>
				<div
					class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm"
				>
					{{ userInitials }}
				</div>
				<span class="hidden md:inline text-sm font-medium text-gray-900 dark:text-gray-100">
					{{ user?.username }}
				</span>
				<svg
					class="w-4 h-4 text-gray-600 dark:text-gray-400 transition-transform"
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
				class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
			>
				<button
					type="button"
					tabindex="0"
					aria-label="Toggle theme"
					class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
					@click="handleToggleTheme"
					@keydown.enter="handleToggleTheme"
					@keydown.space.prevent="handleToggleTheme"
				>
					<span>{{ isDark ? 'Tryb jasny' : 'Tryb ciemny' }}</span>
					<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							v-if="isDark"
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
						/>
						<path
							v-else
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
						/>
					</svg>
				</button>
				<button
					type="button"
					tabindex="0"
					aria-label="Logout"
					class="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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
