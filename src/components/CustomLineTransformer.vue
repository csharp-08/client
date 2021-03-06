<template>
  <div>
    <v-line :config="lineConfig"></v-line>
    <template v-for="(x, index) in lineConfig.points">
      <v-rect :config="{...squareConfig, x: x-5, y: lineConfig.points[index + 1]-5}"
            v-if="(index%2 === 0) && !(index === 0 && lineConfig.points.length > 4)"
            @dragmove="updatePoint($event, index)"
            @dragend="update"
            @mouseenter="setCursor($event, 'nwse-resize')"
            @mouseleave="setCursor($event, 'default')"
            :key="`rect_${index}_${x}`"></v-rect>
    </template>
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
      squareConfig: {
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
      const { x: offsetX, y: offsetY } = this.lineNode.attrs;
      const points = JSON.parse(JSON.stringify(this.lineNode.attrs.points));
      if (offsetX || offsetY) { // Removes offset
        for (let i = 0; i < points.length; i += 2) {
          points[i] += offsetX;
          points[i + 1] += offsetY;
        }
      }
      this.lineConfig.points = points;
    },

    updatePoint(event, index) {
      if (!event || !event.target) {
        return;
      }

      const { x, y } = event.target.attrs;
      this.lineConfig.points[0 + index] = x + 5;
      this.lineConfig.points[1 + index] = y + 5;

      const { x: offsetX, y: offsetY } = this.lineNode.attrs;
      this.lineNode.attrs.points[0 + index] = x - offsetX + 5;
      this.lineNode.attrs.points[1 + index] = y - offsetY + 5;

      // For a polygon we update 2 points
      if (index === this.lineConfig.points.length - 2 && this.lineConfig.points.length > 4) {
        this.updatePoint(event, 0);
      }
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
