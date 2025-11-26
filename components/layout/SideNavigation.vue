<script setup lang="ts">
const dashboard = useDashboard()

type NavView = 'chat' | 'friends' | 'invitations' | 'add'

const navItems: Array<{
	name: NavView
	icon: string
	label: string
}> = [
	{ name: 'chat', icon: 'chat', label: 'Chat' },
	{ name: 'friends', icon: 'friends', label: 'Friends' },
	{ name: 'invitations', icon: 'invitations', label: 'Invitations' },
	{ name: 'add', icon: 'add', label: 'Add Friends' }
]

function isActive(item: NavView): boolean {
	const { viewMode, friendsSubView } = dashboard.viewModeComposable

	if (item === 'chat') {
		return viewMode.value === 'chats'
	}

	if (item === 'friends') {
		return viewMode.value === 'friends' && friendsSubView.value === 'list'
	}

	if (item === 'invitations') {
		return viewMode.value === 'friends' && friendsSubView.value === 'invites'
	}

	if (item === 'add') {
		return viewMode.value === 'friends' && friendsSubView.value === 'add'
	}

	return false
}

function handleNavClick(item: NavView) {
	if (item === 'chat') {
		dashboard.handleViewModeChange('chats')
		return
	}

	if (item === 'friends') {
		dashboard.handleViewModeChange('friends', 'list')
		return
	}

	if (item === 'invitations') {
		dashboard.handleViewModeChange('friends', 'invites')
		return
	}

	if (item === 'add') {
		dashboard.handleViewModeChange('friends', 'add')
		return
	}
}

function handleKeyDown(event: KeyboardEvent, item: NavView) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleNavClick(item)
	}
}
</script>

<template>
	<nav
		class="w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 flex flex-col items-center py-4 gap-4"
	>
		<button
			v-for="item in navItems"
			:key="item.name"
			type="button"
			:tabindex="0"
			:aria-label="item.label"
			:class="[
				'size-12 rounded-lg flex items-center justify-center transition-colors relative',
				isActive(item.name)
					? 'bg-blue-700 dark:bg-blue-600 text-white'
					: 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
			]"
			@click="handleNavClick(item.name)"
			@keydown="(e) => handleKeyDown(e, item.name)"
		>
			<!-- Chat icon -->
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
			<!-- Friends icon -->
			<svg
				v-else-if="item.icon === 'friends'"
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
			<!-- Invitations icon -->
			<svg
				v-else-if="item.icon === 'invitations'"
				class="size-6"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
			<!-- Add icon -->
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
					d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
				/>
			</svg>
			<!-- Badge for invitations -->
			<span
				v-if="item.name === 'invitations' && dashboard.pendingInvitesTotal.value > 0"
				class="absolute -top-1 -right-1 size-5 bg-red-500 dark:bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
			>
				{{
					dashboard.pendingInvitesTotal.value > 9
						? '9+'
						: dashboard.pendingInvitesTotal.value
				}}
			</span>
		</button>
	</nav>
</template>
