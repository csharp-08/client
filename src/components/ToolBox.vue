<template>
  <div id="toolbox" @click="closeTools">
    <button @click="setTool('select')" :class="{ active: tool === 'select' }">
      <font-awesome-icon icon="mouse-pointer" />
    </button>
    <button @click="setTool('freeLine')" :class="{ active: tool === 'freeLine' }">
      <font-awesome-icon icon="pen"/>
    </button>
    <button @click="setTool('circle')" :class="{ active: tool === 'circle' }">
      <font-awesome-icon icon="circle" />
    </button>
    <button class="colors-container"
            @click.stop="setTool('text'); showText = !showText;"
            :class="{ active: tool === 'text' }">
      <font-awesome-icon icon="font" />
      <div class="stroke-width" v-if="showText" @click.stop>
        <input id="text"
                autocomplete="off"
                v-model="text"
                placeholder="Ton texte ici"
                @input="updateParam({ text })"
                />
      </div>
    </button>
    <div class="divider"></div>
    <button :style="{ color }" @click.stop="showColors = !showColors" class="colors-container">
      <font-awesome-icon icon="palette" />
      <div v-show="showColors" class="colors" @click.stop>
        <button v-for="c in colors"
                :key="c"
                :style="{ color: c, backgroundColor: c }"
                @click="updateParam({ color: c })">
        </button>
      </div>
    </button>
    <button class="colors-container" @click.stop="showStroke = !showStroke">
      <span style="font-size: 0.6rem"><font-awesome-icon icon="circle" /></span>
      <span style="font-size: 1rem"><font-awesome-icon icon="circle" /></span>
      <span><font-awesome-icon icon="circle" /></span>
      <span style="font-size: 1rem; margin-left: 0.2rem">{{strokeWidth}}px</span>
      <div class="stroke-width" v-if="showStroke" @click.stop>
        <input v-model="strokeWidth" type="range"
               @change="updateParam({ strokeWidth: parseInt(strokeWidth, 10) })"
               min="3" max="100" value="15" class="slider" id="myRange">
      </div>
    </button>
  </div>
</template>

<script>
export default {
  name: 'Toolbox',
  props: {
    tool: {
      type: String,
      default: '',
    },
    params: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return {
      strokeWidth: 15,
      color: 'rgb(76, 76, 76)',
      showColors: false,
      showStroke: false,
      showText: false,
      colors: [
        'black', 'red', 'blue', 'green', 'yellow', 'white',
      ],
      text: '',
    };
  },
  methods: {
    updateParam(param) {
      if (param.color) {
        this.color = param.color;
        this.showColors = false;
      }
      this.$emit('update-params', param);
    },
    setTool(tool, params) {
      this.$emit('select-tool', { tool, params: params || {} });
    },
    closeTools() {
      this.showColors = false;
      this.showStroke = false;
      this.showText = false;
    },
  },
};
</script>

<style scoped>
  #toolbox {
    height: 50px;
    border-bottom: 1px solid #7c7c7c;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, .5);
    display: flex;
  }
  button {
    height: 50px;
    min-width: 50px;
    background-color: white;
    outline: none;
    border: none;
    cursor: pointer;
    font-size: 1.3rem;
    color: rgb(76, 76, 76);
  }
  button:hover {
    background-color: #d1d1d1;
  }
  button.active {
    background-color: #e4e4e4;
  }
  .divider {
    width: 1px;
    height: 50px;
    margin: 0 0.5rem;
    padding: 0;
    display: inline;
    background-color: #d1d1d1;
  }
  .colors-container {
    position: relative;
  }
  .colors {
    z-index: 10;
    background-color: white;
    position: absolute;
    top: 50px;
    display: flex;
    left: -12px;
    width: 72px;
    flex-wrap: wrap;
    border: 1px solid #7c7c7c;
    border-top: none;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, .5);
  }
  .colors > button {
    width: 1.3rem;
    height: 1.3rem;
    padding: 0;
    margin: 0.1rem;
    min-width: unset;
    border: 1px solid #7c7c7c;
  }
  .stroke-width {
    z-index: 10;
    background-color: white;
    position: absolute;
    top: 50px;
    left: -20px;
    display: flex;
    width: 150px;
    border: 1px solid #7c7c7c;
    border-top: none;
    box-shadow: 1px 2px 4px rgba(0, 0, 0, .5);
  }
  .stroke-width > input {
    width: 100%;
  }
  #text {
    margin: 0.2rem 0.3rem;
  }
</style>
