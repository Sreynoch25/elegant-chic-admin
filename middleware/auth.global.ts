// middleware/auth.global.ts
export default defineNuxtRouteMiddleware((to) => {
  const authenticated = useCookie("token");

  // If not authenticated and trying to access protected routes, redirect to login
  if (!authenticated.value && to.path !== "/login") {
    return navigateTo("/login");
  }

  // If authenticated and trying to access login page, redirect to dashboard/home
  if (authenticated.value && to.path === "/login") {
    return navigateTo("/");
  }

  // If authenticated and on root path, redirect to dashboard
  if (authenticated.value && to.path === "/") {
    return;
  }
});
