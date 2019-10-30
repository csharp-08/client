<!--suppress ALL -->
<template>
  <div id="shape-params">
    <div class="title">
      <h2>Parametres</h2>
    </div>
    <div class="content">
      <div v-for="(object, p) in filteredProperties" :key="p" class="input-field">
        <label style="color: white;">{{object.text}}</label>
        <verte model="hex"
               :id="p"
               class="params-color"
               picker="square"
               v-model="properties[p].color"
               :showHistory="false"
               :colorHistory="null"
               :draggable="false"
               :enableAlpha="false"
               v-if="object.type === 1"
               ref="verte"
        >
          <span :style="{ color: properties[p].color || '#000000', fill: properties[p].color || '#000000' }">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="50"/>
            </svg>
          </span>
        </verte>
        <input v-model="params[p]"
               type="number"
               @input="updateNode(p)"
               v-else-if="object.type > 0"/>
        <template v-else>
          <input :id="p"
                 v-model="params[p]"
                 type="checkbox"
                 class="noFlex"
                 @change="updateNode(p)"/>
          <label :for="p" style="flex: 1; color: white; cursor: pointer;">
            {{params[p] ? 'oui' : 'non'}}
          </label>
        </template>
      </div>
      <div class="divider"></div>
      <div class="input-field" v-if="(node.attrs || {}).isOwner">
        <label style="color: white;">Autoriser l'edition</label>
        <input id="can-move-toggle"
               type="checkbox"
               :checked="value[shapeID].overrideUserPolicy & 1"
               @change="updatePermission(false)"
               class="noFlex"/>
        <label for="can-move-toggle" style="flex: 1; color: white; cursor: pointer;">
          {{value[shapeID].overrideUserPolicy & 1 ? 'oui' : 'non'}}
        </label>
      </div>
      <div class="input-field" v-if="(node.attrs || {}).isOwner">
        <label style="color: white;">Autoriser la suppression</label>
        <input id="can-delete-toggle"
               type="checkbox"
               :checked="value[shapeID].overrideUserPolicy >> 1"
               @change="updatePermission(true)"
               class="noFlex"/>
        <label for="can-delete-toggle" style="flex: 1; color: white; cursor: pointer;">
          {{value[shapeID].overrideUserPolicy >> 1 ? 'oui' : 'non'}}
        </label>
      </div>
      <div class="divider"></div>
      <button v-on:click="deleteShape()" v-if="(node.attrs || { canDelete: false }).canDelete">Supprimer la forme</button>
    </div>
  </div>
</template>

<script>
import Verte from 'verte';
// 0 -> boolean, 1 -> color, 2 -> number, 3 -> number (0 - 1), 4 -> number (0 - 360)

export default {
  name: 'ShapeParams',
  components: {
    Verte,
  },
  props: {
    node: {
      type: Object,
      default: () => ({}),
    },
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  beforeMount() {
    this.updateData();
  },
  mounted() {
    const { attrs } = this.node;
    this.properties.fill.color = attrs.fill || '';
    this.properties.stroke.color = attrs.stroke || '';
    this.addColorPickerButtons('fill');
    this.addColorPickerButtons('stroke');
  },
  computed: {
    shapeName() {
      return ((this.node.attrs || {}).name || '').split('-')[0];
    },
    filteredProperties() {
      return Object.keys(this.properties).reduce((props, p) => {
        if (this.properties[p].shapes.includes(this.shapeName)) {
          props[p] = this.properties[p];
        }
        return props;
      }, {});
    },
    shapeID() {
      return parseInt(((this.node.attrs || {}).name || '').split('-')[1], 10);
    },
  },
  data() {
    return {
      properties: {
        fill: {
          type: 1,
          text: 'Remplissage',
          shapes: ['circle', 'text'],
          color: '',
        },
        fillEnabled: {
          type: 0,
          text: 'Remplissage',
          shapes: ['circle', 'text'],
        },
        stroke: {
          type: 1,
          text: 'Couleur du trait',
          shapes: ['circle', 'line', 'freeline', 'text'],
          color: '',
        },
        strokeWidth: {
          type: 2,
          text: 'Epaisseur du trait',
          shapes: ['circle', 'line', 'freeline', 'text'],
        },
        fontSize: {
          type: 2,
          text: 'Taille de la police',
          shapes: ['text'],
        },
      },
      params: {},
    };
  },
  methods: {
    updateData() {
      this.params = {
        ...{
          fill: '',
          fillEnabled: false,
          stroke: '',
          strokeWidth: 5,
        },
        ...this.node.attrs,
      };
    },
    updateNode(p) {
      if (this.properties[p].type > 1) {
        this.$emit('update-node', { param: p, value: Math.max(parseInt(this.params[p], 10), 3) });
      } else {
        this.$emit('update-node', { param: p, value: this.params[p] });
      }
    },
    deleteShape() { this.$emit('delete-shape'); },
    updatePermission(forDelete) {
      const s = this.value[this.shapeID];
      if (!s) {
        return;
      }
      if (forDelete) {
        this.$emit('permission-shape', { id: this.shapeID, permission: s.overrideUserPolicy ^ 0b10 });
      } else {
        this.$emit('permission-shape', { id: this.shapeID, permission: s.overrideUserPolicy ^ 0b01 });
      }
    },
    addColorPickerButtons(p) {
      const $el = document.getElementById(p);
      if ($el !== null) {
        const $parent = $el.children[1].children[0];
        const $newChild = document.createElement('div');
        $newChild.innerHTML = `<div class="verte__inputs"><button type="button" class="verte__model" id="${p}_exit">
Annuler</button><button type="button" class="verte__model" id="${p}_ok">Ok</button></div>`;
        $newChild.className = 'verte__controller new';
        $parent.appendChild($newChild);
        document.getElementById(`${p}_exit`).addEventListener('click', () => {
          this.properties[p].color = this.params[p];
          $el.children[0].click();
        });
        document.getElementById(`${p}_ok`).addEventListener('click', () => {
          this.params[p] = this.properties[p].color;
          this.updateNode(p);
          $el.children[0].click();
        });
      }
    },
  },
};
</script>

<style scoped>
#shape-params {
  width: 400px;
  height: CALC(100vh - 50px);
  position: absolute;
  top: 50px;
  right: 0;
  background-color: #2298b9;
  z-index: 10;
  box-shadow: -2px 2px 4px rgba(0, 0, 0, .5);
  color: rgba(0, 0, 0, 0.85);
}
.title {
  background-color: #006a89;
  color: white;
  padding: 0.5rem 1rem;
}
.title > h2 {
  padding: 0;
  margin: 0;
}
.input-field {
  margin: 0.2rem 0;
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
}
.input-field > label {
  margin-left: 0.5rem;
}
.input-field > input {
  flex: 1;
  margin: 0 0.5rem 0 0.25rem;
  padding: 0.15rem 0.5rem;
  border: 1px solid #afafaf;
  outline: none;
  color: rgb(76, 76, 76);
}
input.noFlex {
  flex: unset;
  margin-right: 0.2rem;
  margin-left: 0.5rem;
  cursor: pointer;
}
</style>

<style>
.verte__controller.new button {
  font-size: 1rem;
  justify-content: flex-end;
}
.verte__controller.new button:last-child {
  flex: 1;
}
.params-color .verte__guide {
  height: 25px;
  width: 25px;
  background-color: transparent;
}
</style>
