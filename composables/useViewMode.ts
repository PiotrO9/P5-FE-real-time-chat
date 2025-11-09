export type ViewMode = 'chats' | 'friends'
export type SubView = 'list' | 'add' | 'invites'

export function useViewMode() {
	const viewMode = ref<ViewMode>('chats')
	const friendsSubView = ref<SubView>('list')

	function setViewMode(mode: ViewMode) {
		viewMode.value = mode
		if (mode === 'friends') {
			friendsSubView.value = 'list'
		}
	}

	function setFriendsSubView(subView: SubView) {
		friendsSubView.value = subView
	}

	return {
		viewMode,
		friendsSubView,
		setViewMode,
		setFriendsSubView
	}
}
