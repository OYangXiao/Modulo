<template>
  <div class="mod">
    <h1>this is vue extended mod</h1>
    <div>{{ time }}</div>
    <img style="width: 100px;" :src="vueimg" alt="" srcset="">
  </div>
</template>
<script lang="ts">
import vue from 'vue'
import vueimg from './vue.png'

export default vue.extend({
  mounted() {
    console.log('vue module mounted')
    setInterval(() => {
      this.time = new Date()
    }, 1000);
  },
  data() {
    return {
      vueimg,
      time: new Date()
    }
  }
})
</script>

<style scoped>
.mod {
  flex: 100px;
  width: 200px;
  color: blue;
}
</style>
