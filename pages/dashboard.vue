<script setup lang="ts">
import ChatList from '~/components/chat/ChatList.vue'
import ChatPanel from '~/components/chat/ChatPanel.vue'
import ChatActionsPanel from '~/components/chat/ChatActionsPanel.vue'
import MessageForm from '~/components/message/MessageForm.vue'
import FriendsList from '~/components/friends/FriendsList.vue'
import AddFriendsPanel from '~/components/friends/AddFriendsPanel.vue'
import InvitesPanel from '~/components/friends/InvitesPanel.vue'

const dashboard = useDashboard()

onMounted(async () => {
	await dashboard.initialize()
})

onUnmounted(() => {
	dashboard.cleanup()
})
</script>

<template>
	<div class="h-screen w-screen bg-slate-50 overflow-hidden">
		<div class="h-full w-full">
			<div class="h-full flex bg-white relative">
				<aside
					:class="[
						'w-full md:max-w-96 h-dvh border-gray-200 flex flex-col p-4 bg-gray transition-transform duration-300 ease-in-out',
						dashboard.chatsComposable.selectedChat.value ? 'hidden md:flex' : 'flex'
					]"
				>
					<div class="flex flex-col rounded-lg bg-white h-full">
						<div
							class="p-4 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 rounded-t-[1.125rem]"
						>
							<div class="flex items-center justify-between mb-3">
								<h1 class="text-lg md:text-xl font-semibold text-slate-900">
									{{
										dashboard.viewModeComposable.viewMode.value === 'chats'
											? 'Messages'
											: 'Friends'
									}}
								</h1>
								<div class="flex gap-1">
									<button
										type="button"
										:class="[
											'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
											dashboard.viewModeComposable.viewMode.value === 'chats'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Chats view"
										@click="dashboard.handleViewModeChange('chats')"
										@keydown.enter="dashboard.handleViewModeChange('chats')"
										@keydown.space.prevent="
											dashboard.handleViewModeChange('chats')
										"
									>
										Chats
									</button>
									<button
										type="button"
										:class="[
											'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
											dashboard.viewModeComposable.viewMode.value ===
											'friends'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Friends view"
										@click="dashboard.handleViewModeChange('friends')"
										@keydown.enter="dashboard.handleViewModeChange('friends')"
										@keydown.space.prevent="
											dashboard.handleViewModeChange('friends')
										"
									>
										Friends
									</button>
								</div>
							</div>

							<template
								v-if="dashboard.viewModeComposable.viewMode.value === 'friends'"
							>
								<div class="flex gap-2 mb-3">
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
											dashboard.viewModeComposable.friendsSubView.value ===
											'list'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Friends list"
										@click="dashboard.handleFriendsSubViewChange('list')"
										@keydown.enter="
											dashboard.handleFriendsSubViewChange('list')
										"
										@keydown.space.prevent="
											dashboard.handleFriendsSubViewChange('list')
										"
									>
										Friends
									</button>
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors relative',
											dashboard.viewModeComposable.friendsSubView.value ===
											'invites'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Invitations"
										@click="dashboard.handleFriendsSubViewChange('invites')"
										@keydown.enter="
											dashboard.handleFriendsSubViewChange('invites')
										"
										@keydown.space.prevent="
											dashboard.handleFriendsSubViewChange('invites')
										"
									>
										Invitations
										<span
											v-if="
												dashboard.invitesComposable.invites.value
													.totalPending > 0
											"
											class="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
										>
											{{
												dashboard.invitesComposable.invites.value
													.totalPending > 9
													? '9+'
													: dashboard.invitesComposable.invites.value
															.totalPending
											}}
										</span>
									</button>
									<button
										type="button"
										:class="[
											'flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
											dashboard.viewModeComposable.friendsSubView.value ===
											'add'
												? 'bg-blue-500 text-white'
												: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
										]"
										tabindex="0"
										aria-label="Add friends"
										@click="dashboard.handleFriendsSubViewChange('add')"
										@keydown.enter="dashboard.handleFriendsSubViewChange('add')"
										@keydown.space.prevent="
											dashboard.handleFriendsSubViewChange('add')
										"
									>
										Add
									</button>
								</div>
							</template>

							<template
								v-if="dashboard.viewModeComposable.viewMode.value === 'chats'"
							>
								<label for="chat-search" class="sr-only">Search chat</label>
								<input
									id="chat-search"
									v-model="dashboard.searchQuery"
									type="text"
									placeholder="Search..."
									class="w-full px-3 py-2 text-xs md:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</template>
						</div>

						<template v-if="dashboard.viewModeComposable.viewMode.value === 'chats'">
							<div
								v-if="dashboard.chatsComposable.chatsLoading.value"
								class="p-4 text-sm text-slate-600"
							>
								Loading chats...
							</div>
							<div
								v-else-if="dashboard.chatsComposable.chatsError.value"
								class="p-4 text-sm text-red-600"
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
							v-else-if="dashboard.viewModeComposable.viewMode.value === 'friends'"
						>
							<div
								v-if="dashboard.viewModeComposable.friendsSubView.value === 'list'"
								class="h-full"
							>
								<div
									v-if="dashboard.friendsComposable.friendsLoading.value"
									class="p-4 text-sm text-slate-600"
								>
									Loading friends...
								</div>
								<div
									v-else-if="dashboard.friendsComposable.friendsError.value"
									class="p-4 text-sm text-red-600"
								>
									{{ dashboard.friendsComposable.friendsError.value }}
								</div>
								<FriendsList
									v-else
									:friends="dashboard.friendsComposable.friends.value"
									@remove-friend="dashboard.handleRemoveFriend"
									@start-chat="dashboard.handleStartChat"
								/>
							</div>
							<div
								v-else-if="
									dashboard.viewModeComposable.friendsSubView.value === 'invites'
								"
							>
								<div
									v-if="dashboard.invitesComposable.invitesLoading.value"
									class="p-4 text-sm text-slate-600"
								>
									Loading invitations...
								</div>
								<div
									v-else-if="dashboard.invitesComposable.invitesError.value"
									class="p-4 text-sm text-red-600"
								>
									{{ dashboard.invitesComposable.invitesError.value }}
								</div>
								<InvitesPanel
									v-else
									:sent-invites="
										dashboard.invitesComposable.invites.value.sentInvites
									"
									:received-invites="
										dashboard.invitesComposable.invites.value.receivedInvites
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
						'w-full p-4 md:pl-0 bg-gray transition-transform duration-300 ease-in-out',
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
										(dashboard.messagesComposable.newMessageText.value = val)
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
</template>
