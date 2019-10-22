<template>
  <div id="toolbox" @click="closeTools">
    <button @click="setTool('select')" :class="{ active: tool === 'select' }">
      <font-awesome-icon icon="mouse-pointer" />
    </button>
    <button @click="setTool('freeLine')" :class="{ active: tool === 'freeLine' }">
      <font-awesome-icon icon="pen"/>
    </button>
    <button @click="setTool('line')" :class="{ active: tool === 'line' }">
      <span style="font-size: 3rem; line-height: 2rem;">-</span>
    </button>
    <button @click="setTool('circle')" :class="{ active: tool === 'circle' }">
      <font-awesome-icon icon="circle" />
    </button>
    <button @click="setTool('polygon')" :class="{ active: tool === 'polygon' }">
      <font-awesome-icon icon="draw-polygon" />
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
    <div class="divider"></div>
    <button @click="showModal = true">
      <font-awesome-icon icon="cogs" />
    </button>

    <div class="toRight" :key="Object.keys(users).length">
      <div class="username">{{(users[id] || {}).Username}}</div>
      <div class="colors-container users">({{Object.keys(users).length}} personne(s) dans le salon)
        <div class="colors users">
          <h4 v-for="uid in others" :key="uid">
            - {{users[uid].Username}}
          </h4>
        </div>
      </div>
    </div>

    <div class="modal-wrapper" @click="showModal = false" v-if="showModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Parametres :</h2>
          <div class="close-icon" @click="showModal = false">
            <font-awesome-icon icon="times" />
          </div>
        </div>
        <div class="content">
          <div>
            <ToggleButton :value="((users[id] || {}).OverridePermissions & 1) === 1" @change="updatePermission(false)"></ToggleButton>
            <span style="margin-left: 0.4rem">Autoriser l'edition de tout mes objets</span>
          </div>
          <div style="margin-top: 0.8rem">
            <ToggleButton :value="((users[id] || {}).OverridePermissions >> 1) === 1" @change="updatePermission(true)"></ToggleButton>
            <span style="margin-left: 0.4rem">Autoriser la suppression de tout mes objets</span>
          </div>
        </div>
      </div>
    </div>
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
    id: {
      type: String,
      default: '',
    },
    users: {
      type: Object,
      default: () => ({}),
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
      showModal: false,
    };
  },
  computed: {
    others() {
      return Object.keys(this.users).filter(key => key !== this.id);
    },
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
    updatePermission(forDelete) {
      const u = this.users[this.id];
      if (!u) {
        return;
      }
      if (forDelete) {
        this.$emit('update-permission', { p: u.OverridePermissions ^ 0b10 });
      } else {
        this.$emit('update-permission', { p: u.OverridePermissions ^ 0b01 });
      }
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
    align-items: center;
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
  .toRight {
    flex: 1;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    align-items: center;
    padding: 0.5rem;
  }
  .username {
    outline: none;
    background-color: #006a89;
    color: #fff;
    border-radius: 2rem;
    border: none;
    padding: 0.6rem 1.2rem;
    margin: 0 1rem;
    font-weight: bold;
  }
  .modal-wrapper {
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.2);
  }
  .modal {
    border: 1px solid rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    width: 480px;
    height: auto;
    background-color: white;
  }
  .modal > div {
    padding: 0 1rem;
  }
  .modal > .modal-header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.5);
    position: relative;
  }
  .modal > .content {
    padding: 2rem 1rem;
  }
  .close-icon {
    position: absolute;
    cursor: pointer;
    top: -2.5rem;
    right: -1rem;
  }
  .colors.users {
    left: unset;
    right: -0.5rem;
    width: 100%;
    box-shadow: unset;
    padding: 0 0.5rem;
    border-right: none;
    display: none;
    cursor: default;
  }
  .colors-container.users {
    height: 50px;
    display: flex;
    align-items: center;
    cursor: pointer;
  }
  .colors-container.users:hover > .colors.users {
    display: block;
  }
  .colors.users > h4 {
    margin: 0.2rem 0;
  }
</style>
