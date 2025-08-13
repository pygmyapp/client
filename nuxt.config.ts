export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      gateway: {
        encoding: 'json',
        debug: 2
      }
    }
  },
  routeRules: {
    '/api/**': {
      proxy: {
        to: `http://127.0.0.1:3001/**`
      }
    }
  },
  appConfig: {
    ui: {
      colors: {
        primary: 'cyan',
        neutral: 'zinc'
      }
    },
    toaster: {
      position: 'top-center' as const,
      expand: false
    }
  },
  icon: {
    localApiEndpoint: '/icon-api'
  }
})