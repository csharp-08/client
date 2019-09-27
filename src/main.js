import Vue from 'vue';
import VueKonva from 'vue-konva';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faMousePointer, faPen, faCircle, faPalette, faSquare,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueKonva);

/* ICONS */
library.add(faMousePointer);
library.add(faPen);
library.add(faCircle);
library.add(faPalette);
library.add(faSquare);
Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
  render: h => h(App),
}).$mount('#app');
