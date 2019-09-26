<template>
  <div class="container" ref='container'>
    Canvas. Bonjour {{username}} !
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
export default {
  name: 'Canvas',
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
    };
  },
  methods: {
    newLine(event) {
      this.lineList.push({
        points: [event.evt.offsetX, event.evt.offsetY, event.evt.offsetX, event.evt.offsetY],
        stroke: 'blue',
        strokeWidth: 15,
        lineCap: 'round',
        lineJoin: 'round',
      });
      this.isDrawing = true;
    },
    addPoints(event) {
      if (this.isDrawing) {
        const lastIndex = this.lineList.length - 1;
        this.lineList[lastIndex].points.push(event.evt.offsetX, event.evt.offsetY);
      }
    },

    move() {
      console.log('okok');
    }
  },
};
</script>

<style scoped>
.container {
  width: 100vw;
  height: 100vh;
}
</style>
