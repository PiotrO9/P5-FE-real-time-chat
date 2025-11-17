export function normalizeDate(date: string | Date | undefined | null): string | undefined {
	if (!date) return undefined
	if (typeof date === 'string') return date
	if (date instanceof Date) return date.toISOString()
	return String(date)
}
