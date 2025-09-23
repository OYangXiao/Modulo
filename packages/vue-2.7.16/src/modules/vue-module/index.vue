<template>
  <div class="mod">
    <h1>this is vue extended mod</h1>
    <div>{{ time }}</div>
    <img style="width: 100px;" :src="vueimg" alt="" srcset="">
    <div class="same-name"></div>
  </div>
</template>
<script lang="ts">
import vue from 'vue'
import vueimg from './vue.png'

export default vue.extend({
  name: 'vue-module',
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
<style>
.same-name {
  width: 100px;
  height: 100px;
  background-color: aqua;
}
</style>
<style scoped>
.mod {
  flex: 100px;
  width: 200px;
  color: blue;
}
</style>
