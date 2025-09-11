// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: "2025-05-15",
  devtools: { enabled: false },

  css: ["~/assets/css/main.css"],

  vite: {
    plugins: [tailwindcss()],
  },

  modules: [
    "@ant-design-vue/nuxt",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "dayjs-nuxt"
  ],

  runtimeConfig: {
    public: {
      apiEndPoint:
        process.env.NUXT_PUBLIC_API_ENDPOINT || "http://localhost:8000",
    },
  },

  // App Head Configuration (favicon, meta, title)
  app: {
    head: {
      title: "Elegant chic admin",
      meta: [
        { charset: "utf-8" },
        {
          name: "viewport",
          content:
            "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no",
        },
      ],
      link: [
        { rel: "icon", type: "logo", href: "/logo/logo.png" },
      ],
    },
  },

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

  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },
});
