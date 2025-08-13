export default defineNuxtRouteMiddleware((to, from) => {
  const { loggedIn } = useAuth();

if (loggedIn.value) {
    if (to.path === from.path) return navigateTo('/');

    return navigateTo(from.path);
  }
});
