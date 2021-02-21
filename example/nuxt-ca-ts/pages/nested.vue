<template>
  <div>
    <div class="a">
      <div class="b">Text {{ lorem }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { ref, computed, defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    let lorem = ref('lorem text')
    return { lorem }
  },
})
</script>

<style lang="postcss" scoped>
.a {
  & .b {
    @apply text-black;

    /*
    // commented not working line
    
    &:hover {
      @apply text-green;
    } 
    */
  }
}
</style>
