import type { UseFetchOptions } from 'nuxt/app';
import { defu } from 'defu';
import { storeToRefs } from 'pinia';
import { $fetch } from 'ofetch'; // optional, in case Nuxt doesn't auto-define
import { useLoginStore } from '~/stores/login/loginStore';

export async function useFetchDataApi<T>(
  url: string,
  options: UseFetchOptions<T> = {},
  opts?: {
    redirectOnError?: boolean;
  }
) {
  const accessToken = useCookie('accessToken');
  const { authenticated } = storeToRefs(useLoginStore());
  const config = useRuntimeConfig();

  const defaults = {
    baseURL: config.public.apiEndPoint,
    headers: accessToken.value
      ? {
          Authorization: `Bearer ${accessToken.value}`,
        }
      : {},
  };

  const params = defu(options, defaults);

  try {
    const response = await $fetch<T>(url, params as any);
    return { data: ref(response) };
  } catch (error: any) {
    const status = error.response?.status;

    if (status === 401) {
      authenticated.value = false;

      if (opts?.redirectOnError) {
        await navigateTo('/login');
        return { data: ref(null) };
      }
    }

    throw error;
  }
}
