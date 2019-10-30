<template>
  <div>
    <v-line :config="lineConfig"></v-line>
    <v-rect :config="aConfig"
            @dragmove="updateLine($event, 0)"
            @dragend="update"
            @mouseenter="setCursor($event, 'nwse-resize')"
            @mouseleave="setCursor($event, 'default')"></v-rect>
    <v-rect :config="bConfig"
            @dragmove="updateLine($event, 2)"
            @dragend="update"
            @mouseenter="setCursor($event, 'nwse-resize')"
            @mouseleave="setCursor($event, 'default')"></v-rect>
  </div>
</template>

<script>
export default {
  name: 'CustomLineTransformer',
  props: {
    lineNode: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      aConfig: {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: 'white',
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        opacity: 1,
        draggable: true,
      },
      bConfig: {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
        fill: 'white',
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        opacity: 1,
        draggable: true,
      },
      lineConfig: {
        x: 0,
        y: 0,
        stroke: 'rgb(0, 161, 255)',
        strokeWidth: 1,
        opacity: 1,
        points: [25, 55, 65, 105],
      },
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      const { x, y } = this.lineNode.attrs;
      const points = JSON.parse(JSON.stringify(this.lineNode.attrs.points));
      if (x || y) {
        for (let i = 0; i < points.length; i += 2) {
          points[i] += x;
          points[i + 1] += y;
        }
      }
      this.aConfig.x = points[0] - 5;
      this.aConfig.y = points[1] - 5;
      this.bConfig.x = points[2] - 5;
      this.bConfig.y = points[3] - 5;
      this.lineConfig.points = points;
    },
    updateLine(event, first) {
      if (!event || !event.target) {
        return;
      }
      const { x, y } = event.target.attrs;
      this.lineConfig.points[0 + first] = x + 5;
      this.lineConfig.points[1 + first] = y + 5;

      const { x: x2, y: y2 } = this.lineNode.attrs;
      this.lineNode.attrs.points[0 + first] = x + 5 - x2;
      this.lineNode.attrs.points[1 + first] = y + 5 - y2;
    },
    setCursor(event, cursor) {
      if (!event || !event.target) {
        return;
      }
      const stage = event.target.getStage();
      stage.container().style.cursor = cursor;
    },
    update() {
      this.$emit('transformend');
    },
  },
};
</script>

<style scoped>
.test {
  cursor: move;
}
</style>
