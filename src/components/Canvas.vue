<template>
  <div class="container" ref='container'>
    <tool-box @select-tool="setTool($event)"
              @update-params="Object.assign(toolParams, $event)" ></tool-box>
    <v-stage :config="configKonva"
             @mousedown="startDrawing($event)"
             @mousemove="draw($event)"
             @mouseup="stopDrawing($event)">
      <v-layer>
        <template v-for="(shape, index) in shapes">
          <component :is="shape.component"
                     :config="shape.config"
                     :key="`${index}_${tools[shape.toolName].getKey(shape)}`"></component>
        </template>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import ToolBox from './ToolBox.vue';

import FreeLineTool from './tools/freeLineTool';

export default {
  name: 'Canvas',
  components: {
    ToolBox,
  },
  props: {
    username: {
      type: String,
      default: '',
    },
  },
  mounted() {
    this.configKonva.width = this.$refs.container.clientWidth;
    this.configKonva.height = this.$refs.container.clientHeight - 50;
  },
  data() {
    return {
      configKonva: {
        width: 0,
        height: 0,
      },
      shapes: [],
      isDrawing: false,
      toolParams: {},
      tool: 'select',
      tools: {
        freeLine: new FreeLineTool(),
      },
    };
  },
  methods: {
    startDrawing(event) {
      if (Object.keys(this.tools).includes(this.tool)) {
        const newShape = this.tools[this.tool].startDrawing(event, this.toolParams);
        if (newShape !== null) {
          this.shapes.push(newShape);
          this.isDrawing = true;
        }
      }
    },
    draw(event) {
      if (this.isDrawing) {
        const newShape = this.shapes[this.shapes.length - 1] || null;
        if (newShape === null) {
          return;
        }
        this.tools[this.tool].draw(event, newShape);
      }
    },
    stopDrawing(event) {
      if (this.isDrawing) {
        const newShape = this.shapes[this.shapes.length - 1] || null;
        this.tools[this.tool].stopDrawing(event, newShape);
        this.isDrawing = false;
      }
    },
    setTool({ tool, params }) {
      this.tool = tool;
      this.toolParams = params;
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
