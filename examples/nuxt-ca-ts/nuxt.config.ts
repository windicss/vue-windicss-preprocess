import { defineNuxtConfig } from '@nuxtjs/composition-api'

export default defineNuxtConfig({
  buildModules: ['@nuxt/typescript-build', '@nuxtjs/composition-api'],
  build: {
    extend(config) {
      config.module?.rules.push({
        test: /\.vue$/,
        loader: 'vue-windicss-preprocess',
        options: {
          config: 'tailwind.config.js',
          compile: process.env.NODE_ENV === 'production',
          globalPreflight: true,
          globalUtility: true,
        },
      })
    },
  },
})
