<template>
  <div class="container">
    Canvas. Bonjour {{username}} !
  </div>
</template>

<script>
export default {
  name: 'Canvas',
  props: {
    username: {
      type: String,
      default: '',
    },
  },
};
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}
</style>
