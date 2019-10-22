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
                 @delete-shape="deleteSelectedShape()"
                 :key="selectedNode.attrs.name"></ShapeParams>
    <div class="stage-container" :class="{ showParams: selectedNode !== null}">
      <v-stage :config="configKonva"
               @click="selectShape"
               @mousedown="startDrawing($event)"
               @mousemove="draw($event)"
               @mouseup="stopDrawing($event)">
        <v-layer ref="layer">
          <template v-for="(shape, index) in temporaryShape">
            <component :is="shape.component"
                       @dragmove="updateLineTransformer"
                       @dragend="handleDragEnd($event, index)"
                       :config="{ ...shape.config, draggable: tool === 'select'}"
                       :key="`temp_${index}_${tools[shape.toolName].getKey(shape)}`"></component>
          </template>

          <template v-for="(shape, shapeID) in shapes">
            <component :is="shape.component"
                       @dragmove="updateLineTransformer"
                       @dragend="handleDragEnd($event, shapeID)"
                       :config="{ ...shape.config, draggable: tool === 'select' && shape.config.canEdit}"
                       :key="`shape_${shapeID}_${tools[shape.toolName].getKey(shape)}`"></component>
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
  data() {
    return {
      configKonva: {
        width: 0,
        height: 0,
      },
      shapes: {},
      temporaryShape: [],
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
  mounted() {
    this.configKonva.width = this.$refs.container.clientWidth;
    this.configKonva.height = this.$refs.container.clientHeight - 51;
    this.connection.on('newShape', (shapeType, shape) => {
      const newShape = this.convertJSONToShape(shapeType, shape);
      newShape.owner = shape.owner.connectionId;
      newShape.overrideUserPolicy = shape.overrideUserPolicy || 0b00;
      const owner = this.users[newShape.owner] || { OverridePermissions: 0b00 };
      newShape.config.canEdit = newShape.owner === this.id || ((owner.OverridePermissions & 1) !== (newShape.overrideUserPolicy & 1));
      newShape.config.canDelete = newShape.owner === this.id || ((owner.OverridePermissions >> 1) !== (newShape.overrideUserPolicy >> 1));
      this.shapes[shape.id] = newShape;
      this.$forceUpdate();
    });
    this.connection.on('updateShape', (shapeType, shape) => {
      if (shapeType === null) {
        console.log('THERE IS A BACKEND PROBLEM. ASK MAYEUL');
      } else {
        const newShape = this.convertJSONToShape(shapeType, shape);
        newShape.owner = shape.owner.connectionId;
        newShape.overrideUserPolicy = shape.overrideUserPolicy || 0b00;
        const owner = this.users[newShape.owner] || { OverridePermissions: 0b00 };
        newShape.config.canEdit = newShape.owner === this.id || ((owner.OverridePermissions & 1) !== (newShape.overrideUserPolicy & 1));
        newShape.config.canDelete = newShape.owner === this.id || ((owner.OverridePermissions >> 1) !== (newShape.overrideUserPolicy >> 1));
        this.shapes[shape.id] = newShape;
        this.$forceUpdate();
      }
    });
    this.connection.on('deleteShape', (shapeType, id) => {
      if (id === null) {
        console.log('forbiden, no rights');
        return;
      }
      if (!delete this.shapes[id]) {
        console.log("failed to delete shape, it doesn't exist");
        return;
      }
      console.log('deleted shape');
      this.$forceUpdate();
    });
  },
  methods: {
    startDrawing(event) {
      if (this.$refs.toolbox) {
        this.$refs.toolbox.closeTools();
      }
      if (Object.keys(this.tools).includes(this.tool)) {
        const newShape = this.tools[this.tool].startDrawing(event, this.toolParams);
        if (newShape !== null) {
          this.temporaryShape.push(newShape);
          this.isDrawing = true;
        }
      }
    },
    draw(event) {
      if (this.isDrawing) {
        const newShape = this.temporaryShape[this.temporaryShape.length - 1] || null;
        if (newShape === null) {
          return;
        }
        this.tools[this.tool].draw(event, newShape);
        this.$forceUpdate();
      }
    },
    async stopDrawing(event) {
      if (this.isDrawing) {
        const currentTool = this.tools[this.tool];
        const currentIndex = this.temporaryShape.length - 1;
        const newShape = this.temporaryShape[currentIndex] || null;
        const idTempShape = newShape.id;
        currentTool.stopDrawing(event, newShape);
        this.isDrawing = false;

        try {
          await this.connection.invoke('AddShape', currentTool.getShapeType(), currentTool.convertShapeToJSON(newShape));
        } catch (err) {
          console.error(err.toString());
          console.log('failed sending');
          this.temporaryShape.some((value, index) => {
            if (value.id === idTempShape) {
              this.temporaryShape.pop(index);
              return true;
            }
            return false;
          });
          this.$forceUpdate();
          return;
        }
        console.log('succeded sending');
        this.temporaryShape.some((value, index) => {
          if (value.id === idTempShape) {
            this.temporaryShape.pop(index);
            return true;
          }
          return false;
        });
        this.$forceUpdate();
      }
    },
    setTool({ tool, params }) {
      this.tool = tool;
      this.toolParams = Object.assign(this.toolParams, params);
    },
    handleDragEnd(event, id) {
      this.shapes[id].config = this.tools[this.shapes[id].toolName].update(
        this.shapes[id].config, event.target.attrs,
      );
      this.$forceUpdate();
      this.sendUpdateShape(id).catch();
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
      console.log(selectedNode);
      if (!selectedNode || (selectedNode && selectedNode.attrs && selectedNode.attrs.canEdit !== undefined && !selectedNode.attrs.canEdit)) {
        this.selectedLine = null;
        this.selectedNode = null;
        transformerNode.detach();
        transformerNode.getLayer().batchDraw();
        return;
      }

      // do nothing if selected node is already attached
      if (selectedNode === transformerNode.node()) {
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
      const id = parseInt(newConfig.name.split('-')[1], 10) || null;
      if (id === null) {
        return;
      }

      this.shapes[id].config = this.tools[this.shapes[id].toolName].update(
        this.shapes[id].config, newConfig,
      );

      this.shapes[id].config.scaleX = newConfig.scaleX;
      this.shapes[id].config.scaleY = newConfig.scaleY;
      this.shapes[id].config.rotation = newConfig.rotation;
      this.$forceUpdate();
      this.sendUpdateShape(id).catch();
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
      const id = parseInt(newConfig.name.split('-')[1], 10) || null;
      if (id === null) {
        return;
      }
      this.shapes[id].config.points = newConfig.points;
      this.sendUpdateShape(id).catch();
    },
    updateNode({ param, value }) {
      if (!this.selectedNode) {
        return;
      }
      const newConfig = this.selectedNode.attrs;
      const id = parseInt(newConfig.name.split('-')[1], 10) || null;
      if (id === null) {
        return;
      }
      this.selectedNode.attrs[param] = value;
      this.shapes[id].config[param] = value;
      this.selectedNode.getLayer().batchDraw();
      this.sendUpdateShape(id).catch();
    },
    deleteSelectedShape() {
      if (!this.selectedNode) {
        return;
      }
      const newConfig = this.selectedNode.attrs;
      const id = parseInt(newConfig.name.split('-')[1], 10) || null;
      if (id === null) {
        return;
      }
      this.deleteShape(id);
    },
    async deleteShape(id) {
      try {
        const currentTool = this.tools[this.shapes[id].toolName];
        await this.connection.invoke('DeleteShape', currentTool.getShapeType(), currentTool.convertShapeToJSON(this.shapes[id], id));
      } catch (err) {
        console.error(err.toString());
        console.log('failed deleting');
      }
    },
    convertJSONToShape(shapeType, json) {
      switch (shapeType.toString()) {
        case this.tools.text.getShapeType():
          return this.tools.text.convertJSONToShape(json);
        case this.tools.line.getShapeType():
          return this.tools.line.convertJSONToShape(json);
        case this.tools.freeLine.getShapeType():
          return this.tools.freeLine.convertJSONToShape(json);
        case this.tools.circle.getShapeType():
          return this.tools.circle.convertJSONToShape(json);
        default:
          console.log(shapeType);
          console.log(this.tools.text.getShapeType());
          return 'error';
      }
    },
    async sendUpdateShape(id) {
      console.log(id);
      try {
        const currentTool = this.tools[this.shapes[id].toolName];
        await this.connection.invoke('UpdateShape', currentTool.getShapeType(), currentTool.convertShapeToJSON(this.shapes[id], id));
      } catch (err) {
        console.error(err.toString());
        console.log('failed sending');
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
