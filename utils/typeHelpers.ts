export function toNumber(value: string | number): number {
	return typeof value === 'string' ? Number(value) || 0 : value
}

export function toString(value: string | number): string {
	return String(value)
}

export function ensureNumber(value: string | number | undefined | null): number {
	if (value === undefined || value === null) return 0
	return toNumber(value)
}
