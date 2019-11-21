import Vue from 'vue';
import VueKonva from 'vue-konva';
import VueFlashMessage from 'vue-flash-message';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faMousePointer, faPen, faCircle, faPalette, faSquare, faFont, faTimes, faCogs, faDrawPolygon, faDownload,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import ToggleButton from 'vue-js-toggle-button';
import App from './App.vue';

Vue.config.productionTip = false;
Vue.use(VueKonva);
Vue.use(VueFlashMessage);
Vue.use(ToggleButton);

/* ICONS */
library.add(faMousePointer);
library.add(faPen);
library.add(faCircle);
library.add(faPalette);
library.add(faSquare);
library.add(faFont);
library.add(faTimes);
library.add(faCogs);
library.add(faDrawPolygon);
library.add(faDownload);
Vue.component('font-awesome-icon', FontAwesomeIcon);

new Vue({
  render: h => h(App),
}).$mount('#app');
