// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  app: {baseURL: '/'},
  content: {},
  css: ['~/assets/css/layout.css'],
  devtools: {enabled: false},
  experimental: {payloadExtraction: false},
  googleFonts: {families: {Inter: true},},
  gtag: {id: 'AW-11336737732'},
  modules: ['@nuxt/content', '@nuxtjs/google-fonts', 'nuxt-gtag'],
});
