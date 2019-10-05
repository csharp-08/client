<template>
  <div id="shape-params">
    <div class="title">
      <h2>Parametres</h2>
    </div>
    <div class="content">
      YO
    </div>
  </div>
</template>

<script>
export default {
  name: 'ShapeParams',
};
</script>

<style scoped>
#shape-params {
  width: 400px;
  height: CALC(100vh - 50px);
  position: absolute;
  top: 50px;
  right: 0;
  background-color: #2298b9;
  z-index: 10;
  box-shadow: -2px 2px 4px rgba(0, 0, 0, .5);
  color: rgba(0, 0, 0, 0.85);
}
.title {
  background-color: #006a89;
  color: white;
  padding: 0.5rem 1rem;
}
.title > h2 {
  padding: 0;
  margin: 0;
}
</style>
