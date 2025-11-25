export type ViewMode = 'chats' | 'friends'
export type SubView = 'list' | 'add' | 'invites'

export function useViewMode() {
	const viewMode = useState<ViewMode>('viewMode', () => 'chats')
	const friendsSubView = useState<SubView>('friendsSubView', () => 'list')

	function setViewMode(mode: ViewMode, subView?: SubView) {
		viewMode.value = mode
		if (mode === 'friends') {
			if (subView !== undefined) {
				friendsSubView.value = subView
			} else {
				friendsSubView.value = 'list'
			}
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
