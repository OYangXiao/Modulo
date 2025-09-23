<template>
  <div class="content">
    <h1>Rsbuild with Vue</h1>
    <p>Start building amazing things with Rsbuild.</p>
    <vue-module></vue-module>
  </div>
</template>
<script lang="ts">
import vue from 'vue'
import VueModule from '@/modules/vue-module/index.vue'

export default vue.extend({
  components: { VueModule },
  mounted() {
  }
})
</script>

<style scoped>
.content {
  display: flex;
  min-height: 100vh;
  line-height: 1.1;
  text-align: center;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.content h1 {
  font-size: 3.6rem;
  font-weight: 700;
}

.content p {
  font-size: 1.2rem;
  font-weight: 400;
  opacity: 0.5;
}
</style>
