import { defineNuxtPlugin } from '#imports'
import type { NuxtApp } from 'nuxt/app'
import { 
  CarOutlined,
  RocketOutlined, // Alternative for delivery
  SendOutlined     // Alternative for shipping
} from '@ant-design/icons-vue'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  nuxtApp.vueApp.component('TruckOutlined', CarOutlined)
  nuxtApp.vueApp.component('RocketOutlined', RocketOutlined)
  nuxtApp.vueApp.component('SendOutlined', SendOutlined)
})