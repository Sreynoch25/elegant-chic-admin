// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: true },
  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: ["@ant-design-vue/nuxt", "@nuxtjs/google-fonts"],

  // Google Fonts Configuration
  googleFonts: {
    outputDir: "assets/fonts/google",
    fontsDir: "assets/fonts/google",
    base64: true,
    families: {
      Roboto: true,
      Battambang: [400, 500, 600, 700, 800, 900],
      Poppins: [300, 400, 500, 600, 700, 800], 
    },
    download: true,
    display: "swap",
    preload: true,
    useStylesheet: true,
  },
});