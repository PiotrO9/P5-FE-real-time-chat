<script setup lang="ts">
const dashboard = useDashboard()
const { isDark, toggleTheme } = useTheme()

type NavView = 'chat' | 'friends' | 'invitations' | 'add'

const navItems: Array<{
	name: NavView
	icon: string
	label: string
}> = [
	{ name: 'chat', icon: 'chat', label: 'Messages' },
	{ name: 'friends', icon: 'people', label: 'People' },
	{ name: 'add', icon: 'add', label: 'Add' }
]

function isActive(item: NavView): boolean {
	const { viewMode, friendsSubView } = dashboard.viewModeComposable

	switch (item) {
		case 'chat':
			return viewMode.value === 'chats'
		case 'friends':
			return viewMode.value === 'friends' && friendsSubView.value === 'list'
		case 'invitations':
			return viewMode.value === 'friends' && friendsSubView.value === 'invites'
		case 'add':
			return viewMode.value === 'friends' && friendsSubView.value === 'add'
		default:
			return false
	}
}

function handleNavClick(item: NavView) {
	switch (item) {
		case 'chat':
			dashboard.handleViewModeChange('chats')
			break
		case 'friends':
			dashboard.handleViewModeChange('friends', 'list')
			break
		case 'invitations':
			dashboard.handleViewModeChange('friends', 'invites')
			break
		case 'add':
			dashboard.handleViewModeChange('friends', 'add')
			break
	}
}

function handleKeyDown(event: KeyboardEvent, item: NavView) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleNavClick(item)
	}
}

function handleToggleTheme() {
	toggleTheme()
}

function handleLogout() {
	const { logout } = useAuth()
	logout()
	navigateTo('/')
}

function handleThemeKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleToggleTheme()
	}
}

function handleLogoutKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleLogout()
	}
}
</script>

<template>
	<nav
		class="fixed md:relative bottom-0 left-0 right-0 md:right-auto w-full md:w-16 h-16 md:h-full bg-white dark:bg-gray-900 border-t md:border-t-0 md:border-r border-gray-200 dark:border-gray-700 flex flex-row md:flex-col items-center justify-around md:justify-start md:py-4 gap-2 md:gap-4 pb-safe md:pb-4 z-50 md:z-auto shadow-lg md:shadow-none overflow-visible"
	>
		<button
			v-for="item in navItems"
			:key="item.name"
			type="button"
			:tabindex="0"
			:aria-label="item.label"
			:class="[
				'size-12 rounded-full flex items-center justify-center transition-colors relative shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900',
				item.name === 'chat' ? 'md:mb-2' : '',
				isActive(item.name)
					? 'bg-primary text-white'
					: 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400'
			]"
			@click="handleNavClick(item.name)"
			@keydown="(e) => handleKeyDown(e, item.name)"
		>
			<svg
				v-if="item.icon === 'chat'"
				class="size-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
				/>
			</svg>
			<svg
				v-else-if="item.icon === 'people'"
				class="size-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
				/>
			</svg>
			<svg
				v-else-if="item.icon === 'add'"
				class="size-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M12 4v16m8-8H4"
				/>
			</svg>
		</button>

		<button
			type="button"
			:tabindex="0"
			aria-label="Toggle theme"
			class="size-12 rounded-full flex items-center justify-center transition-colors text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 shrink-0 md:mt-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
			@click="handleToggleTheme"
			@keydown="handleThemeKeyDown"
		>
			<svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
			:tabindex="0"
			aria-label="Logout"
			class="size-12 rounded-full flex items-center justify-center transition-colors text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 dark:text-red-400 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-gray-900"
			@click="handleLogout"
			@keydown="handleLogoutKeyDown"
		>
			<svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
				/>
			</svg>
		</button>
	</nav>
</template>
