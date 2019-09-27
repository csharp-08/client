<template>
    <div>
        <button @click="setTool('select', {})">Select</button>
        <button @click="setLineTool('red')">Rouge</button>
        <button @click="setLineTool('blue')">Bleu</button>
        <button @click="setLineTool('green')">Vert</button>
        <button @click="setLineTool('white')">Effacer</button>
        <input v-model="strokeWidth" type="range"
               @change="$emit('update-params', { strokeWidth: parseInt(strokeWidth, 10) })"
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
      setLineTool(color) {
          this.setTool('line', {
              color,
              strokeWidth: parseInt(this.strokeWidth, 10),
          });
      },
      setTool(tool, params) {
        this.$emit('select-tool', { tool, params });
      }
  }
};
</script>

