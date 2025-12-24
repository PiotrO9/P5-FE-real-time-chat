export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.server) return;

    const auth = useAuth();

    if (!auth.isInitialized.value) {
        await auth.checkAuth();
    }

    const publicPages = ['/login', '/register', '/'];
    const isPublicPage = publicPages.includes(to.path);

    if (
        auth.isAuthenticated.value &&
        (to.path === '/login' || to.path === '/register')
    ) {
        return navigateTo('/dashboard');
    }

    if (isPublicPage) return;

    if (!auth.isAuthenticated.value) {
        return navigateTo('/login');
    }
});
