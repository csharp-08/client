<template>
  <div class="container" ref='container'>
    <tool-box @select-tool="setTool($event)"
              @update-params="Object.assign(toolParams, $event)"
              :tool="tool"
              :params="toolParams"
              :id="id"
              :users="users"
              ref="toolbox"
    ></tool-box>
    <v-stage :config="configKonva"
             @click="selectShape"
             @mousedown="startDrawing($event)"
             @mousemove="draw($event)"
             @mouseup="stopDrawing($event)">
      <v-layer>
        <template v-for="(shape, index) in shapes">
          <component :is="shape.component"
                     @dragend="handleDragEnd($event, index)"
                     :config="{ ...shape.config, draggable: tool === 'select'}"
                     :key="`${index}_${tools[shape.toolName].getKey(shape)}`"></component>
        </template>
        <v-transformer ref="transformer" @transformend="transformEnd()"></v-transformer>
      </v-layer>
    </v-stage>
  </div>
</template>

<script>
import ToolBox from './ToolBox.vue';

import FreeLineTool from './tools/freeLineTool';
import CircleTool from './tools/circle';
import TextTool from './tools/text';
import LineTool from './tools/lineTool';

export default {
  name: 'Canvas',
  components: {
    ToolBox,
  },
  props: {
    id: {
      type: String,
      default: '',
    },
    users: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    this.configKonva.width = this.$refs.container.clientWidth;
    this.configKonva.height = this.$refs.container.clientHeight - 51;
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
        circle: new CircleTool(),
        text: new TextTool(),
        line: new LineTool(),
      },
    };
  },
  methods: {
    startDrawing(event) {
      if (this.$refs.toolbox) {
        this.$refs.toolbox.closeTools();
      }
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
        this.$forceUpdate();
      }
    },
    stopDrawing(event) {
      if (this.isDrawing) {
        const newShape = this.shapes[this.shapes.length - 1] || null;
        this.tools[this.tool].stopDrawing(event, newShape);
        this.isDrawing = false;
        this.$forceUpdate();
      }
    },
    setTool({ tool, params }) {
      this.tool = tool;
      this.toolParams = Object.assign(this.toolParams, params);
    },
    handleDragEnd(event, index) {
      console.log('B');
      this.shapes[index].config = this.tools[this.shapes[index].toolName].update(
        this.shapes[index].config, event.target.attrs,
      );
      this.$forceUpdate();
    },
    selectShape(e) {
      if (this.tool !== 'select') {
        return;
      }
      if (e.target === e.target.getStage()) {
        this.updateTransformer('');
        return;
      }

      // clicked on transformer - do nothing
      const clickedOnTransformer = e.target.getParent().className === 'Transformer';
      if (clickedOnTransformer) {
        return;
      }

      // find clicked rect by its name
      const name = e.target.name();
      this.updateTransformer(name || '');
    },
    updateTransformer(nodeName) {
      const transformerNode = this.$refs.transformer.getStage();
      const stage = transformerNode.getStage();

      const selectedNode = stage.findOne(`.${nodeName}`);
      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.node()) {
        return;
      }

      if (selectedNode) {
        // attach to another node
        transformerNode.attachTo(selectedNode);
      } else {
        // remove transformer
        transformerNode.detach();
      }
      transformerNode.getLayer().batchDraw();
    },
    transformEnd() {
      const transformerNode = this.$refs.transformer.getStage();
      const node = transformerNode.node();

      if (!node) {
        return;
      }

      const newConfig = node.attrs;
      const index = this.shapes.reduce(
        (i, o, i2) => (o.config.name === newConfig.name ? i2 : i), null,
      );
      if (index === null) {
        return;
      }

      this.shapes[index].config = this.tools[this.shapes[index].toolName].update(
        this.shapes[index].config, newConfig,
      );

      console.log('A');
      this.shapes[index].config.scaleX = newConfig.scaleX;
      this.shapes[index].config.scaleY = newConfig.scaleY;
      this.shapes[index].config.rotation = newConfig.rotation;
      this.$forceUpdate();
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
