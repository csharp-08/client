<template>
  <div class="container" ref='container'>
    <tool-box @select-tool="setTool($event)"
              @update-params="Object.assign(toolParams, $event)"
              :tool="tool"
              :params="toolParams"
              :id="id"
              :users="users"
              @update-permission="updateUserPermission($event)"
              v-model="backgroundColor"
              ref="toolbox"
    ></tool-box>
    <ShapeParams v-if="selectedNode !== null"
                 :node="selectedNode"
                 v-model="shapes"
                 @update-node="updateNode($event)"
                 @delete-shape="deleteSelectedShape()"
                 @permission-shape="updateShapePermission($event)"
                 :key="`${selectedNode.attrs.name}_${paramsUpdateFix}`"
                 ref="shapeParams"
    ></ShapeParams>
    <div class="stage-container" :class="{ showParams: selectedNode !== null}"
         :style="{ background: bgColor }">
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
    <Animation :color="backgroundColor"></Animation>
  </div>
</template>

<script>
import ToolBox from './ToolBox.vue';
import ShapeParams from './ShapeParams.vue';
import CustomLineTransformer from './CustomLineTransformer.vue';
import Animation from './animation.vue';

import FreeLineTool from './tools/freeLineTool';
import CircleTool from './tools/circle';
import TextTool from './tools/text';
import LineTool from './tools/lineTool';
import PolygonTool from './tools/polygonTool';

export default {
  name: 'Canvas',
  components: {
    ToolBox,
    ShapeParams,
    CustomLineTransformer,
    Animation,
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
      backgroundColor: '#ffffff',
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
        polygon: new PolygonTool(),
      },
      selectedLine: null,
      selectedNode: null,
      paramsUpdateFix: 0,
    };
  },
  computed: {
    bgColor() {
      return `linear-gradient(100deg, whitesmoke -100%, ${this.backgroundColor})`;
    },
  },
  mounted() {
    this.configKonva.width = this.$refs.container.clientWidth;
    this.configKonva.height = this.$refs.container.clientHeight - 51;
    this.connection.on('newShape', (shapeType, shape) => {
      const newShape = this.convertJSONToShape(shapeType, shape);
      newShape.owner = shape.owner.sessionId;
      newShape.overrideUserPolicy = shape.overrideUserPolicy || 0b00;
      const owner = this.users[newShape.owner] || { OverridePermissions: 0b00 };
      newShape.config.canEdit = newShape.owner === this.id || ((owner.OverridePermissions & 1) !== (newShape.overrideUserPolicy & 1));
      newShape.config.canDelete = newShape.owner === this.id || ((owner.OverridePermissions >> 1) !== (newShape.overrideUserPolicy >> 1));
      newShape.config.isOwner = newShape.owner === this.id;
      this.shapes[shape.id] = newShape;
      this.$forceUpdate();
    });
    this.connection.on('updateShape', (shapeType, shape) => {
      if (shapeType === null) {
        this.flash('Erreur, vous n\'avez pas la permission pour mettre a jour cette forme.', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
      } else {
        const newShape = this.convertJSONToShape(shapeType, shape);
        newShape.owner = shape.owner.sessionId;
        newShape.overrideUserPolicy = shape.overrideUserPolicy || 0b00;
        const owner = this.users[newShape.owner] || { OverridePermissions: 0b00 };
        newShape.config.canEdit = newShape.owner === this.id || ((owner.OverridePermissions & 1) !== (newShape.overrideUserPolicy & 1));
        newShape.config.canDelete = newShape.owner === this.id || ((owner.OverridePermissions >> 1) !== (newShape.overrideUserPolicy >> 1));
        newShape.config.isOwner = newShape.owner === this.id;
        this.shapes[shape.id] = newShape;
        this.$forceUpdate();
      }
    });
    this.connection.on('deleteShape', (id) => {
      if (id === null) {
        this.flash('Erreur, vous n\'avez pas la permission pour supprimer cette forme.', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
        return;
      }
      if (this.selectedNode !== null) {
        const selectedId = parseInt((this.selectedNode.attrs || {}).name.split('-')[1], 10) || null;
        if (selectedId === id) {
          this.updateTransformer('');
        }
      }
      if (!delete this.shapes[id]) {
        this.flash('Erreur, cette forme n\'existe pas.', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
        return;
      }
      this.$forceUpdate();
    });
    this.connection.on('newShapePermission', (id, permission) => {
      const shape = this.shapes[id] || null;
      if (shape === null) {
        this.flash('Erreur, forme non trouve dans le serveur', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
        return;
      }
      shape.overrideUserPolicy = parseInt(permission, 10);
      const owner = this.users[shape.owner] || { OverridePermissions: 0b00 };
      shape.config.canEdit = shape.owner === this.id || ((owner.OverridePermissions & 1) !== (shape.overrideUserPolicy & 1));
      shape.config.canDelete = shape.owner === this.id || ((owner.OverridePermissions >> 1) !== (shape.overrideUserPolicy >> 1));
      shape.config.isOwner = shape.owner === this.id;
      this.paramsUpdateFix += 1;
      this.$forceUpdate();
    });
    this.connection.on('newUserPermission', (id, permission) => {
      this.users[id].OverridePermissions = parseInt(permission, 10); // eslint-disable-next-line
      for (const shapeID of Object.keys(this.shapes)) {
        const shape = this.shapes[shapeID];
        const owner = this.users[shape.owner] || { OverridePermissions: 0b00 };
        shape.config.canEdit = shape.owner === this.id || ((owner.OverridePermissions & 1) !== (shape.overrideUserPolicy & 1));
        shape.config.canDelete = shape.owner === this.id || ((owner.OverridePermissions >> 1) !== (shape.overrideUserPolicy >> 1));
      }
      this.$forceUpdate();
    });
  },
  methods: {
    startDrawing(event) {
      if (this.$refs.toolbox) {
        this.$refs.toolbox.closeTools();
      }
      if (this.isDrawing) {
        // Special case where a drawing needs to clic several times
        this.stopDrawing(event);
        return;
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
        if (currentTool.stopDrawing(event, newShape)) {
          this.isDrawing = false;
          try {
            await this.connection.invoke('AddShape', currentTool.getShapeType().toString(), currentTool.convertShapeToJSON(newShape));
          } catch (err) {
            console.error(err.toString());
            console.log('failed sending');
            this.flash('Erreur, impossible d\'envoyer la forme au serveur...', 'error', {
              timeout: 30 * 1000, // 30 seconds
            });
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
          this.temporaryShape.some((value, index) => {
            if (value.id === idTempShape) {
              this.temporaryShape.pop(index);
              return true;
            }
            return false;
          });
          this.$forceUpdate();
        }
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
        await this.connection.invoke('DeleteShape', id);
      } catch (err) {
        console.error(err.toString());
        console.log('failed deleting');
        this.flash('Erreur, impossible de supprimer la forme...', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
      }
    },
    convertJSONToShape(shapeType, json) {
      switch (parseInt(shapeType, 10)) {
        case this.tools.text.getShapeType():
          return this.tools.text.convertJSONToShape(json);
        case this.tools.line.getShapeType():
          return this.tools.line.convertJSONToShape(json);
        case this.tools.freeLine.getShapeType():
          return this.tools.freeLine.convertJSONToShape(json);
        case this.tools.circle.getShapeType():
          return this.tools.circle.convertJSONToShape(json);
        case this.tools.polygon.getShapeType():
          return this.tools.polygon.convertJSONToShape(json);
        default:
          console.log(shapeType);
          console.log(this.tools.text.getShapeType());
          return 'error';
      }
    },
    async sendUpdateShape(id) {
      try {
        const currentTool = this.tools[this.shapes[id].toolName];
        await this.connection.invoke('UpdateShape', currentTool.getShapeType().toString(), currentTool.convertShapeToJSON(this.shapes[id], id));
      } catch (err) {
        console.error(err.toString());
        console.log('failed sending');
        this.flash('Erreur, impossible de mettre a jour la forme...', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
      }
    },
    async updateShapePermission({ id, permission }) {
      try {
        await this.connection.invoke('UpdateShapePermission', id, permission);
      } catch (err) {
        console.error(err.toString());
        console.log('failed sending');
        this.flash('Erreur, impossible de mettre a jour les permissions...', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
      }
    },
    async updateUserPermission({ p }) {
      try {
        await this.connection.invoke('UpdateUserPermission', p);
      } catch (err) {
        console.error(err.toString());
        console.log('failed sending');
        this.flash('Erreur, impossible de mettre a jour les permissions...', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
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
