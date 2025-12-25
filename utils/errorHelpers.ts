export function getErrorMessage(err: any, defaultMessage: string): string {
    const responseData = err?.response?._data;
    
    if (responseData?.message) {
        return responseData.message;
    }
    
    if (responseData?.error) {
        return responseData.error;
    }
    
    if (err?.message) {
        return err.message;
    }
    
    return defaultMessage;
}
