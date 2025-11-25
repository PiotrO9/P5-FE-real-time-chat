<script setup lang="ts">
import ChatList from '~/components/chat/ChatList.vue'
import ChatPanel from '~/components/chat/ChatPanel.vue'
import ChatActionsPanel from '~/components/chat/ChatActionsPanel.vue'
import MessageForm from '~/components/message/MessageForm.vue'
import FriendsList from '~/components/friends/FriendsList.vue'
import AddFriendsPanel from '~/components/friends/AddFriendsPanel.vue'
import InvitesPanel from '~/components/friends/InvitesPanel.vue'
import AppHeader from '~/components/layout/AppHeader.vue'
import SideNavigation from '~/components/layout/SideNavigation.vue'

const dashboard = useDashboard()

onMounted(async () => {
	await dashboard.initialize()
})

onUnmounted(() => {
	dashboard.cleanup()
})
</script>

<template>
	<div class="h-screen w-screen overflow-hidden relative">
		<!-- Gradient background -->
		<div class="fixed inset-0 pointer-events-none z-0">
			<div
				class="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"
			></div>
			<div
				class="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-pink-200/30 to-purple-200/30 rounded-full blur-3xl"
			></div>
		</div>

		<div class="h-full w-full flex flex-col relative z-10 bg-white dark:bg-gray-900">
			<AppHeader />
			<div class="flex-1 flex overflow-hidden">
				<SideNavigation />
				<div class="flex-1 flex overflow-hidden">
					<aside
						:class="[
							'w-full md:max-w-96 h-full border-r border-gray-200 dark:border-gray-700 flex flex-col bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out',
							dashboard.chatsComposable.selectedChat.value ? 'hidden md:flex' : 'flex'
						]"
					>
						<div class="flex flex-col h-full">
							<div
								class="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 gap-2 flex flex-col"
							>
								<div class="flex items-center justify-between">
									<h1
										class="text-lg md:text-xl font-semibold text-slate-900 dark:text-gray-100"
									>
										{{
											dashboard.viewModeComposable.viewMode.value === 'chats'
												? 'Chats'
												: 'Friends'
										}}
									</h1>
								</div>

								<template
									v-if="dashboard.viewModeComposable.viewMode.value === 'chats'"
								>
									<div class="relative">
										<label for="chat-search" class="sr-only">Search chat</label>
										<input
											id="chat-search"
											v-model="dashboard.searchQuery.value"
											type="text"
											placeholder="Search..."
											class="w-full pl-10 pr-3 py-2 text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
										<svg
											class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
											/>
										</svg>
									</div>
								</template>
							</div>

							<template
								v-if="dashboard.viewModeComposable.viewMode.value === 'chats'"
							>
								<div
									v-if="dashboard.chatsComposable.chatsLoading.value"
									class="p-4 text-sm text-slate-600 dark:text-gray-400"
								>
									Loading chats...
								</div>
								<div
									v-else-if="dashboard.chatsComposable.chatsError.value"
									class="p-4 text-sm text-red-600 dark:text-red-400"
								>
									{{ dashboard.chatsComposable.chatsError.value }}
								</div>
								<ChatList
									v-else
									:chats="dashboard.chatsComposable.filteredChats.value"
									:selected-chat-id="
										dashboard.chatsComposable.selectedChatId.value?.toString() ??
										null
									"
									:typing-users-by-chat="dashboard.typingUsersByChat.value"
									@select-chat="dashboard.handleSelectChat"
								/>
							</template>

							<template
								v-else-if="
									dashboard.viewModeComposable.viewMode.value === 'friends'
								"
							>
								<template
									v-if="
										dashboard.viewModeComposable.friendsSubView.value === 'list'
									"
								>
									<div class="px-4 py-3">
										<label
											for="friends-search"
											class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
											>Wyszukaj znajomych</label
										>
										<input
											id="friends-search"
											v-model="dashboard.friendsComposable.searchQuery.value"
											type="text"
											placeholder="Wyszukaj znajomych..."
											class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										/>
										<p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
											Enter the username of the person you want to search
										</p>
									</div>
								</template>
								<div
									v-if="
										dashboard.viewModeComposable.friendsSubView.value === 'list'
									"
									class="h-full"
								>
									<div
										v-if="dashboard.friendsComposable.friendsLoading.value"
										class="p-4 text-sm text-slate-600 dark:text-gray-400"
									>
										Loading friends...
									</div>
									<div
										v-else-if="dashboard.friendsComposable.friendsError.value"
										class="p-4 text-sm text-red-600 dark:text-red-400"
									>
										{{ dashboard.friendsComposable.friendsError.value }}
									</div>
									<FriendsList
										v-else
										:friends="
											dashboard.friendsComposable.displayedFriends.value
										"
										@remove-friend="dashboard.handleRemoveFriend"
										@start-chat="dashboard.handleStartChat"
									/>
								</div>
								<div
									v-else-if="
										dashboard.viewModeComposable.friendsSubView.value ===
										'invites'
									"
								>
									<div
										v-if="dashboard.invitesComposable.invitesLoading.value"
										class="p-4 text-sm text-slate-600 dark:text-gray-400"
									>
										Loading invitations...
									</div>
									<div
										v-else-if="dashboard.invitesComposable.invitesError.value"
										class="p-4 text-sm text-red-600 dark:text-red-400"
									>
										{{ dashboard.invitesComposable.invitesError.value }}
									</div>
									<InvitesPanel
										v-else
										:sent-invites="
											dashboard.invitesComposable.invites.value.sentInvites
										"
										:received-invites="
											dashboard.invitesComposable.invites.value
												.receivedInvites
										"
										@accept-invite="dashboard.handleAcceptInvite"
										@reject-invite="dashboard.handleRejectInvite"
									/>
								</div>
								<AddFriendsPanel v-else @add-friend="dashboard.handleAddFriend" />
							</template>
						</div>
					</aside>

					<div
						:class="[
							'w-full flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-900 transition-transform duration-300 ease-in-out',
							dashboard.chatsComposable.selectedChat.value ? 'flex' : 'hidden md:flex'
						]"
					>
						<div class="flex-1 flex flex-col min-h-0 w-full h-full">
							<ChatPanel
								:ref="(el) => (dashboard.chatPanelRef.value = el)"
								:selected-chat="dashboard.chatsComposable.selectedChat.value"
								:current-user-id="dashboard.currentUserId.value"
								:typing-users="dashboard.currentTypingUsers.value"
								:available-chats="dashboard.chatsComposable.chats.value"
								:can-load-more="
									dashboard.chatsComposable.selectedChat.value
										? dashboard.messagesComposable.messagesState[
												dashboard.chatsComposable.selectedChat.value.id
											]?.hasMore
										: false
								"
								:is-loading-more="
									dashboard.chatsComposable.selectedChat.value
										? dashboard.messagesComposable.messagesState[
												dashboard.chatsComposable.selectedChat.value.id
											]?.loading
										: false
								"
								@load-more="dashboard.handleLoadMore"
								@delete-message="dashboard.handleDeleteMessage"
								@reaction-updated="dashboard.handleReactionUpdated"
								@pin-updated="dashboard.handlePinUpdated"
								@reply="dashboard.handleReply"
								@scroll-to-message="dashboard.handleScrollToMessage"
								@forward-message="dashboard.handleForwardMessage"
								@open-pinned-messages="dashboard.handleOpenPinnedMessages"
								@mark-latest-as-read="dashboard.handleMarkLatestMessageAsRead"
								@toggle-actions="
									dashboard.isActionsPanelOpen.value =
										!dashboard.isActionsPanelOpen.value
								"
								@back="dashboard.handleBackToChats"
							/>
							<template v-if="dashboard.chatsComposable.selectedChat.value">
								<MessageForm
									:model-value="dashboard.messagesComposable.newMessageText.value"
									:reply-to="dashboard.replyToMessage.value"
									@update:model-value="
										(val: string) =>
											(dashboard.messagesComposable.newMessageText.value =
												val)
									"
									@submit="dashboard.handleSendMessage"
									@typing="dashboard.handleTypingInput"
									@cancel-reply="dashboard.handleCancelReply"
								/>
							</template>
						</div>
					</div>

					<ChatActionsPanel
						v-if="dashboard.currentChat.value"
						v-model="dashboard.isActionsPanelOpen.value"
						:chat="dashboard.currentChat.value"
						:current-user-id="dashboard.currentUserId.value"
						@chat-updated="dashboard.handleChatUpdated"
						@close="dashboard.isActionsPanelOpen.value = false"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
