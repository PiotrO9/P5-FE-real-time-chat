export interface Api {
    get<T>(url: string, params?: Record<string, any>): Promise<T>;
    post<T>(url: string, body: Record<string, any>): Promise<T>;
    put<T>(url: string, body?: Record<string, any>): Promise<T>;
    patch<T>(url: string, body?: Record<string, any>): Promise<T>;
    delete<T>(url: string, params?: Record<string, any>): Promise<T>;
    setHeader(headers: Record<string, string>): void;
    deleteHeader(headerName: string): void;
    streamResponse(url: string, body: Record<string, any>): Promise<Response>;
}

declare module '#app' {
    interface NuxtApp {
        $api: Api;
    }
}

export default defineNuxtPlugin(() => {
    const api = $fetch.create({
        baseURL: useRuntimeConfig().public.apiBaseUrl,
        credentials: 'include',
        async onResponseError({ response }) {
            if (response.status === 401) {
                const authStore = useAuthStore();

                await authStore.logout();

                if (import.meta.client) {
                    navigateTo('/login');
                }
            }
        },
    });

    return {
        provide: {
            api,
        },
    };
});
