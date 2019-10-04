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
        this.connection.invoke('AddShape', this.getType(newShape), this.convertShapeToJSON(newShape))
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
    convertShapeToJSON(shape) {
      var points = [];
      var previous = 0;

      switch (shape.toolName) {
        case 'freeLine':
          shape.config.points.forEach((item, index, _array) => {
            if (index % 2) {
              points.push({ Item1: previous, Item2: item });
            } else {
              previous = item;
            }
          });

          return JSON.stringify({
            Vertices: points,
            Thickness: shape.config.strokeWidth,
            Color: shape.config.color,
            Owner: { ID: this.id, username: 'lol non' },
          });
        default:
          return 'error';
      }
    },
    convertJSONToShape(shapeType, json) {
      switch (shapeType) {
        case 'Line':
          return {
            component: 'v-Line',
            toolName: 'freeLine',
            config: {
              points: json.vertices.flatMap(x => [x.item1, x.item2]),
              stroke: 'blue',
              strokeWidth: json.thickness,
              lineCap: 'round',
              lineJoin: 'round',
            },
          };
        default:
          return 'error';
      }
    },
    getType(shape) {
      switch (shape.toolName) {
        case 'freeLine':
          return 'Line';
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
</style>
