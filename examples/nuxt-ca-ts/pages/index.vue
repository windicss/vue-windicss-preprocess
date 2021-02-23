<template>
  <div>
    <h1 class="text-6xl font-bold">
      <span
        class="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500"
      >
        Windicss Scroll-snap
      </span>
    </h1>

    <div class="my-20"></div>
    <h2 class="text-xl">snap snap-x</h2>
    <p class="py-2">snap-center</p>
    <div class="flex w-full space-x-5 overflow-x-auto snap snap-x">
      <div class="item from-pink-300 via-purple-300 to-indigo-400"></div>
      <div class="item from-yellow-200 via-yellow-400 to-yellow-700"></div>
      <div class="item from-indigo-300 to-purple-400"></div>
      <div class="item from-green-200 to-green-500"></div>
      <div class="item from-purple-400 to-yellow-400"></div>
      <div class="item from-red-800 via-yellow-600 to-yellow-500"></div>

      <div class="item" v-for="(item, i) in items" :key="i" :class="item"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const items = ref([
      'from-pink-300 via-purple-300 to-indigo-400',
      'from-yellow-200 via-yellow-400 to-yellow-700',
      'from-indigo-300 to-purple-400',
      'from-green-200 to-green-500',

      // undefined dynamic classes not work in script tag
      'from-green-100 to-blue-900',

      'from-purple-400 to-yellow-400',
      'from-red-800 via-yellow-600 to-yellow-500',
    ])

    return { items }
  },
})
</script>

<style lang="postcss">
.item {
  @apply flex-none snap-center w-80vw h-100 rounded bg-gradient-to-r;
}
</style>
