export default defineNuxtConfig({
  compatibilityDate: '2026-07-06',
  devtools: { enabled: false },
  runtimeConfig: {
    public: {
      // NUXT_PUBLIC_API_BASE_URL で上書きできる
      apiBaseUrl: 'http://localhost:8787',
    },
  },
})
