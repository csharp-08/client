<template>
  <div id="toolbox" @click="closeTools">
    <button @click="setTool('select')" :class="{ active: tool === 'select' }"
            class="has-tooltip"
            data-tippy-content="Selectionner">
      <font-awesome-icon icon="mouse-pointer" />
    </button>
    <button @click="setTool('freeLine')" :class="{ active: tool === 'freeLine' }"
            class="has-tooltip"
            data-tippy-content="Dessin">
      <font-awesome-icon icon="pen"/>
    </button>
    <button @click="setTool('line')" :class="{ active: tool === 'line' }"
            class="has-tooltip"
            data-tippy-content="Ligne">
      <span style="font-size: 3rem; line-height: 2rem;">-</span>
    </button>
    <button @click="setTool('circle')" :class="{ active: tool === 'circle' }"
            class="has-tooltip"
            data-tippy-content="Cercle">
      <font-awesome-icon icon="circle" />
    </button>
    <button @click="setTool('polygon')" :class="{ active: tool === 'polygon' }"
            class="has-tooltip"
            data-tippy-content="Polygone">
      <font-awesome-icon icon="draw-polygon" />
    </button>
    <button class="colors-container has-tooltip"
            @click.stop="selectText"
            :class="{ active: tool === 'text' }"
            data-tippy-content="Texte">
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
    <button :style="{ color }" @click.stop="showColors = !showColors" class="colors-container has-tooltip"
            data-tippy-content="Couleur">
      <font-awesome-icon icon="palette" />
      <div v-show="showColors" class="colors" @click.stop>
        <button v-for="c in colors"
                :key="c"
                :style="{ color: c, backgroundColor: c }"
                @click="updateParam({ color: c })">
        </button>
      </div>
    </button>
    <button class="colors-container has-tooltip" @click.stop="showStroke = !showStroke"
            data-tippy-content="Eppaisseur">
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
    <button @click="showModal = true"
            class="has-tooltip"
            data-tippy-content="Paramètres">
      <font-awesome-icon icon="cogs" />
    </button>

    <div class="toRight" :key="Object.keys(users).length">
      <div class="username">{{(users[id] || {}).Username}}</div>
      <div class="colors-container users">({{Object.keys(users).length}} personne(s) dans le salon)
        <div class="colors users">
          <div class="username" style="text-align: center; margin: 0.25rem 0" :style="getColor(index)" v-for="(uid, index) in others" :key="uid">
            {{users[uid].Username}}
          </div>
        </div>
      </div>
    </div>

    <div class="modal-wrapper" @click="showModal = false" v-if="showModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2>Paramètres :</h2>
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
          <div>
            <button class="bg-button" @click.stop="openBg"><span>Changer la couleur de fond</span></button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-container" @click="showBgModal = false" v-if="showBgModal">
      <div class="grid-item" v-for="card in cards" @click.stop="select(card)" :key="card.color">
        <div class="grid-cell--top" :style="gradient(card)">
          <span v-html="card.emoji"></span>
        </div>
        <div class="grid-cell--bottom" :style="{ color: card.color }">
          {{ card.color.toUpperCase() }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';

function emojify(name) {
  return `<img class="emoji" src="emojis/${name}.png">`;
}

const colors = [
  'rgba(103, 0, 137, 0.55)',
  'rgba(137, 0, 38, 0.55)',
  'rgba(66, 137, 0, 0.55)',
  'rgba(135, 137, 0, 0.55)',
  'rgba(137, 0, 0, 0.55)',
  'rgba(0, 80, 137, 0.55)',
  'rgba(84, 0, 137, 0.55)',
  'rgba(137, 88, 0, 0.55)',
  'rgba(0, 137, 99, 0.55)',
  'rgba(137, 50, 0, 0.55)',
  'rgba(46, 0, 137, 0.55)',
];

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
    bgColor: {
      type: String,
      default: '#ffffff',
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
      showBgModal: false,
      activeCard: null,
      cards: [
        { emoji: emojify('lion'), color: '#ff691f' },
        { emoji: emojify('tiger'), color: '#fab81e' },
        { emoji: emojify('fish'), color: '#7fdbb6' },
        { emoji: emojify('frog'), color: '#19cf86' },
        { emoji: emojify('dolphin'), color: '#91d2fa' },
        { emoji: emojify('whale'), color: '#1b95e0' },
        { emoji: emojify('elephant'), color: '#abb8c2' },
        { emoji: emojify('octopus'), color: '#e81c4f' },
        { emoji: emojify('pig'), color: '#f58ea8' },
        { emoji: emojify('unicorn'), color: '#981ceb' },
        { emoji: emojify('rabbit'), color: '#ffffff' },
        { emoji: emojify('wolf'), color: '#000000' },
      ],
    };
  },
  computed: {
    others() {
      return Object.keys(this.users).filter(key => key !== this.id);
    },
  },
  mounted() {
    tippy('button.has-tooltip');
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
    getColor(index) {
      return { backgroundColor: colors[index] };
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
    gradient(card) {
      return {
        background: `linear-gradient(100deg, whitesmoke -100%, ${card.color})`,
      };
    },
    selectText() {
      this.setTool('text');
      this.showText = !this.showText;
    },
    select(card) {
      this.showBgModal = false;
      this.$emit('update-bgcolor', card.color);
    },
    openBg() {
      this.showModal = false;
      this.showBgModal = true;
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
    padding: 0.25rem 0.5rem;
    display: none;
    cursor: default;
    border: none;
    background-color: transparent;
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
  .grid-container {
    position: absolute;
    z-index: 20;
    top: 0;
    left: 0;
    width: calc(100vw - 192px);
    height: calc(100vh - 192px);
    background: rgba(0, 0, 0, 0.2);
    display: grid;
    grid-template-areas:
      ". . . ."
      ". . . ."
      ". . . .";
    padding: 96px;
    grid-gap: 32px;
    overflow: hidden;
  }
  .grid-item {
    display: grid;
    grid-template-rows: 65% 35%;
    background: whitesmoke;
    border-radius: 4px; box-shadow: rgba(0, 0, 0, 0.25) 0px 10px 60px;
    transition: transform 500ms;
    font: 1rem/1.175 "BlinkMacSystemFont", -apple-system, "Roboto", sans-serif;
  }
  .grid-item:hover {
    transition: transform 500ms;
    transform: scale(1.1);
    cursor: pointer;
  }
  .grid-cell--top, .grid-cell--bottom {
    display: flex;
    justify-content: center; align-items: center;
  }
  .grid-cell--top    { border-radius: 4px 4px 0 0; }
  .grid-cell--bottom { font-weight: 900; font-size: 1.75rem; }
  .bg-button {
    font-size: 1rem;
    height: unset;
    width: unset;
    margin-top: 1rem;
    color: #fff;
    background-color: rgb(191, 203, 217);
    border-radius: 20px;
  }
</style>
<style>
  img.emoji {
    width: 3.5rem; height: 3.5rem;
    vertical-align: calc(-0.12109375em);
  }
</style>
