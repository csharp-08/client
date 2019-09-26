<template>
  <div class="container" ref='container'>
    <div>
      <div>Canvas. Bonjour {{username}} !</div>
      <button @click="color = 'red'">Rouge</button>
      <button @click="color = 'blue'">Bleu</button>
      <button @click="color = 'green'">Vert</button>
      <button @click="color = 'white'">Effacer</button>
      <input @change="updateStroke($event)" type="range"
          min="3" max="100" value="15" class="slider" id="myRange">
    </div>
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
      color: 'blue',
      strokeWidth: 15,
    };
  },
  methods: {
    newLine(event) {
      this.lineList.push({
        points: [event.evt.offsetX, event.evt.offsetY, event.evt.offsetX, event.evt.offsetY],
        stroke: this.color,
        strokeWidth: this.strokeWidth,
        lineCap: 'round',
        lineJoin: 'round',
      });
      console.log('is drawing');
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
    },

    updateStroke(event) {
      console.log(event.srcElement.value);
      this.strokeWidth = event.srcElement.value;
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
