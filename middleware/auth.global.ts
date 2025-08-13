
import { useLoginStore } from "~/stores/login/loginStore";

export default defineNuxtRouteMiddleware((to) => {
    const { authenticated } = storeToRefs(useLoginStore());
    const token = useCookie('accessToken');
    
    if (token.value) {
        authenticated.value = true;
    }
    
    if (!to.matched.length && to.name !== 'not-found') {
        abortNavigation();
        return navigateTo('/not-found');
    }
    
    if (token.value && to?.name === 'login') {
        abortNavigation();
        return navigateTo('/');
    }
    
    if (!token.value && to?.name !== 'login' && to?.name !== 'not-found') {
        abortNavigation();
        return navigateTo('/login');
    }
}); 