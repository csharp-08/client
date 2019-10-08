<!--suppress ALL -->
<template>
  <div id="shape-params">
    <div class="title">
      <h2>Parametres</h2>
    </div>
    <div class="content">
      <div v-for="(object, p) in filteredProperties" :key="p" class="input-field">
        <label style="color: white;">{{object.text}}</label>
        <input v-model="params[p]"
               :type="object.type === 1 ? 'text' : 'number'"
               @input="updateNode(p)"
               v-if="object.type > 0"/>
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
    </div>
  </div>
</template>

<script>
// 0 -> boolean, 1 -> color, 2 -> number, 3 -> number (0 - 1), 4 -> number (0 - 360)

export default {
  name: 'ShapeParams',
  props: {
    node: {
      type: Object,
      default: () => ({}),
    },
  },
  beforeMount() {
    this.updateData();
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
  },
  data() {
    return {
      properties: {
        fill: {
          type: 1,
          text: 'Remplissage',
          shapes: ['circle', 'text'],
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
        this.$emit('update-node', { param: p, value: parseInt(this.params[p], 10) });
      } else {
        this.$emit('update-node', { param: p, value: this.params[p] });
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
