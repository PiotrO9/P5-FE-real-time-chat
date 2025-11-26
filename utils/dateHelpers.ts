export function normalizeDate(date: string | Date | undefined | null): string | undefined {
	if (!date) return undefined
	if (typeof date === 'string') return date
	if (date instanceof Date) return date.toISOString()
	return String(date)
}

export function formatDate(dateString: string): string {
	if (!dateString) return ''
	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)

	if (diffMins < 1) return 'Now'
	if (diffMins < 60) return `${diffMins} min ago`
	if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`

	return date.toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
	})
}
