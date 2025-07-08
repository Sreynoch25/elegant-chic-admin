// // middleware/auth.global.ts
// export default defineNuxtRouteMiddleware((to) => {
//   const authenticated = useCookie("token");

import { useLoginStore } from "~/stores/login/loginStore";

//   // If not authenticated and trying to access protected routes, redirect to login
//   if (!authenticated.value && to.path !== "/login") {
//     return navigateTo("/login");
//   }

//   // If authenticated and trying to access login page, redirect to dashboard/home
//   if (authenticated.value && to.path === "/login") {
//     return navigateTo("/");
//   }

//   // If authenticated and on root path, redirect to dashboard
//   if (authenticated.value && to.path === "/") {
//     return;
//   }
// });

export default defineNuxtRouteMiddleware((to, from) => {
    // console.log("to", to);
    
    const { authenticated } = storeToRefs(useLoginStore());
    const token = useCookie('accessToken');
    if (token.value) {
        authenticated.value = true;
    }
  
    if (token.value && to?.name === 'login') {
        abortNavigation();
        return navigateTo('/');
    }
    if (!token.value && to?.name !== 'login') {
        abortNavigation();
        return navigateTo('/login');
    }
    
})