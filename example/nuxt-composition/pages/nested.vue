<template>
  <div>
    <div class="a">
      <div class="b">Text</div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue, { PropOptions } from 'vue'
export default Vue.extend({
  props: {},
  data() {
    return {}
  },
  computed: {},
  methods: {},
})
</script>

<style lang="postcss" scoped>
.a {
  & .b {
    @apply text-black;

    &:hover {
      @apply text-green;
    }
  }
}
</style>
