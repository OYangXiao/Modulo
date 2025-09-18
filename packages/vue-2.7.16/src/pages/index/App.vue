<template>
  <div class="content">
    <h1>Rsbuild with Vue</h1>
    <p>Start building amazing things with Rsbuild.</p>
    <vue-show></vue-show>
    <vue-show-bare></vue-show-bare>
  </div>
</template>
<script lang="ts">
import vue from 'vue'
import VueShow from '@/modules/vue-extended-mod/index.vue'
import VueShowBare from '@/modules/vue-bare-mod/index.vue'

export default vue.extend({
  components: { VueShow, VueShowBare },
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
