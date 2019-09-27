<template>
  <div class="container" ref='container'>
    <tool-box @select-tool="setTool($event)"
              @update-params="Object.assign(toolParams, $event)" ></tool-box>
    <v-stage :config="configKonva"
             @mousedown="newLine($event)"
             @mousemove="addPoints($event)"
             @mouseup="isDrawing = false">
      <v-layer>
        <li v-for="(item, index) in lineList" :key="`${index}_${item.points.length}`">
          <v-line :config="item" @mousedown="move"></v-line>
        </li>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import ToolBox from './ToolBox.vue';

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
      lineList: [],
      isDrawing: false,
      toolParams: {},
      tool: 'select'
    };
  },
  methods: {
    newLine(event) {
      if (this.tool === 'line') {
        this.lineList.push({
          points: [event.evt.offsetX, event.evt.offsetY, event.evt.offsetX, event.evt.offsetY],
          stroke: this.toolParams.color || 'red',
          strokeWidth: this.toolParams.strokeWidth || 10,
          lineCap: 'round',
          lineJoin: 'round',
        });
        console.log('is drawing');
        this.isDrawing = true;
      }
    },
    addPoints(event) {
      if (this.isDrawing) {
        const lastIndex = this.lineList.length - 1;
        this.lineList[lastIndex].points.push(event.evt.offsetX, event.evt.offsetY);
      }
    },

    move() {
      console.log('okok');
    },

    setTool({tool, params}) {
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
