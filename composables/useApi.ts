export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export async function useApi<T>(method: Method, url: string, data?: any) {
    const { $api } = useNuxtApp();

    return await $api<T>(url, {
        method,
        body: data,
    });
}
