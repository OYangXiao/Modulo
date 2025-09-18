<template>
  <div class="mod">
    <h1>this is vue bare mod</h1>
    <div class="same-name"></div>
  </div>
</template>
<script lang="ts">

export default {
  mounted() {
    console.log('vue bare module mounted')
  },
  data() {
    return {
    }
  }
}
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
  width: 300px;
  color: blue;
  background: url(./vue.png) no-repeat center center;
  background-size: contain;
}
</style>
