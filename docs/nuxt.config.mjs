// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {baseURL: '/di/'},
  content: {},
  css: ['~/assets/css/layout.css'],
  devtools: {enabled: false},
  experimental: {payloadExtraction: false},
  googleFonts: {families: {Inter: true},},
  modules: ['@nuxt/content', '@nuxtjs/google-fonts',]
});
