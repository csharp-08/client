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
    <ShapeParams v-if="selectedNode !== null"
                 :node="selectedNode"
                 @update-node="updateNode($event)"
                 :key="selectedNode.attrs.name"></ShapeParams>
    <div class="stage-container" :class="{ showParams: selectedNode !== null}">
      <v-stage :config="configKonva"
               @click="selectShape"
               @mousedown="startDrawing($event)"
               @mousemove="draw($event)"
               @mouseup="stopDrawing($event)">
        <v-layer>
          <template v-for="(shape, index) in shapes">
            <component :is="shape.component"
                       @dragmove="updateLineTransformer"
                       @dragend="handleDragEnd($event, index)"
                       :config="{ ...shape.config, draggable: tool === 'select'}"
                       :key="`${index}_${tools[shape.toolName].getKey(shape)}`"></component>
          </template>
          <v-transformer ref="transformer"
                         @transformend="transformEnd()"
                         :rotationSnaps="[0, 90, 180, 270]"></v-transformer>
          <CustomLineTransformer
            ref="lineTransformer"
            @transformend="transformLineEnd()"
            v-if="selectedLine !== null"
            :line-node="selectedLine"></CustomLineTransformer>
        </v-layer>
      </v-stage>
    </div>
  </div>
</template>

<script>
import ToolBox from './ToolBox.vue';
import ShapeParams from './ShapeParams.vue';
import CustomLineTransformer from './CustomLineTransformer.vue';

import FreeLineTool from './tools/freeLineTool';
import CircleTool from './tools/circle';
import TextTool from './tools/text';
import LineTool from './tools/lineTool';

export default {
  name: 'Canvas',
  components: {
    ToolBox,
    ShapeParams,
    CustomLineTransformer,
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
    connection: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    this.configKonva.width = this.$refs.container.clientWidth;
    this.configKonva.height = this.$refs.container.clientHeight - 51;
    console.log(this.connection);
    this.connection.on('newShape', (shapeType, shape) => {
      console.log('received new shape');
      console.log(shape);
      console.log(this.convertJSONToShape(shapeType, shape));
      this.shapes.push(this.convertJSONToShape(shapeType, shape));
    });
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
      selectedLine: null,
      selectedNode: null,
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
        const currentTool = this.tools[this.tool];
        currentTool.stopDrawing(event, newShape);
        this.connection.invoke('AddShape', currentTool.getClass(), currentTool.convertShapeToJSON(newShape))
          .catch(err => console.error(err.toString()));
        console.log('sent');
        this.isDrawing = false;
        this.$forceUpdate();
      }
    },
    setTool({ tool, params }) {
      this.tool = tool;
      this.toolParams = Object.assign(this.toolParams, params);
    },
    handleDragEnd(event, index) {
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
        this.selectedNode = null;
        this.selectedLine = null;
        return;
      }

      if (selectedNode && nodeName && nodeName.split('-')[0] === 'line') {
        this.selectedLine = selectedNode;
        this.selectedNode = selectedNode;
        if (this.$refs.lineTransformer) {
          this.$nextTick(() => {
            this.$refs.lineTransformer.init();
          });
        }
        transformerNode.detach();
        transformerNode.getLayer().batchDraw();
        return;
      }
      if (selectedNode) {
        // attach to another node
        this.selectedNode = selectedNode;
        transformerNode.attachTo(selectedNode);
        console.log(transformerNode.borderStroke());
      } else {
        // remove transformer
        this.selectedNode = null;
        transformerNode.detach();
      }
      this.selectedLine = null;
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

      this.shapes[index].config.scaleX = newConfig.scaleX;
      this.shapes[index].config.scaleY = newConfig.scaleY;
      this.shapes[index].config.rotation = newConfig.rotation;
      this.$forceUpdate();
    },
    updateLineTransformer() {
      if (this.$refs.lineTransformer) {
        this.$refs.lineTransformer.init();
      }
    },
    transformLineEnd() {
      if (!this.selectedLine) {
        return;
      }
      const newConfig = this.selectedLine.attrs;
      const index = this.shapes.reduce(
        (i, o, i2) => (o.config.name === newConfig.name ? i2 : i), null,
      );
      if (index === null) {
        return;
      }
      this.shapes[index].config.points = newConfig.points;
    },
    updateNode({ param, value }) {
      console.log(param, value);
      if (!this.selectedNode) {
        return;
      }
      const newConfig = this.selectedNode.attrs;
      const index = this.shapes.reduce(
        (i, o, i2) => (o.config.name === newConfig.name ? i2 : i), null,
      );
      if (index === null) {
        return;
      }
      this.selectedNode.attrs[param] = value;
      this.shapes[index].config[param] = value;
      this.selectedNode.getLayer().batchDraw();
    },
    convertJSONToShape(shapeType, json) {
      switch (shapeType) {
        case 'Line':
          return this.tools.freeLine.convertJSONToShape(json);
        default:
          return 'error';
      }
    },
  },
};
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}
.stage-container {
  width: 100vw;
  height: CALC(100vh - 50px);
  overflow: auto;
}
.stage-container.showParams {
  width: CALC(100vw - 400px);
  margin-right: 400px;
}
</style>
