import { defineStore } from 'pinia';
import type { loginTypes, LoginResponse } from '~/types/login/login';

export const useLoginStore = defineStore('useLoginStore', {
  state: () => ({
    authenticated: false,
    isSpinning: false,
    user: {} as loginTypes,
  }),
  actions: {
    async fetchLogin() {
      this.isSpinning = true;

      try {
        const response = await useFetchDataApi<LoginResponse>('/login', {
          method: 'POST',
          body: {
            email: this.user.email,
            password: this.user.password,
          }
        });

        const data = response.data;
        if (data && data.value) {
          const token = useCookie('accessToken');
          token.value = data.value.token;
          this.authenticated = true;
          navigateTo({ name: 'index' });
          return data.value;
        } else {
          throw new Error('Login failed. No data returned.');
        }
      } catch (error: any) {
        if (error?.response?.data) {
          throw error.response.data;
        } else {
          throw { error: error.message || "Unknown error" };
        }
      } finally {
        this.isSpinning = false;
      }
    },

    // 🚀 Logout function
    async fetchLogout() {
      this.isSpinning = true;
      try {
        const token = useCookie('accessToken');

        // Call backend logout (optional if you just want to clear token)
        await useFetchDataApi('/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token.value}`
          }
        });

        // Clear cookie and reset store
        token.value = null;
        this.authenticated = false;
        this.user = {} as loginTypes;

        navigateTo({ name: 'login' });
      } catch (error: any) {
        console.error('Logout failed:', error);
      } finally {
        this.isSpinning = false;
      }
    }
  }
});
