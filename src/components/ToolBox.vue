<template>
    <div>
        <button @click="setTool('select')">Select</button>
        <button @click="setTool('freeLine')">FreeLine</button>
        <button @click="setTool('circle')">Cercle</button>
        <button @click="updateParam({ color: 'red' })">Rouge</button>
        <button @click="updateParam({ color: 'blue' })">Bleu</button>
        <button @click="updateParam({ color: 'green' })">Vert</button>
        <input v-model="strokeWidth" type="range"
               @change="updateParam({ strokeWidth: parseInt(strokeWidth, 10) })"
            min="3" max="100" value="15" class="slider" id="myRange">
    </div>
</template>

<script>
export default {
  name: 'Toolbox',
  data() {
    return {
      strokeWidth: 15,
    };
  },
  methods: {
    updateParam(param) {
      this.$emit('update-params', param);
    },
    setTool(tool, params) {
      this.$emit('select-tool', { tool, params: params || {} });
    },
  },
};
</script>
