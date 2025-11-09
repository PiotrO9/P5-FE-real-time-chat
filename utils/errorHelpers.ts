export function getErrorMessage(err: any, defaultMessage: string): string {
	return err?.response?._data?.message || err?.message || defaultMessage
}

