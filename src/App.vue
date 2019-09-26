<template>
  <div id="app">
    <Canvas v-if="connected" :username="username" @exit="exit"></Canvas>
    <Home @start="start($event)" v-else ></Home>
  </div>
</template>

<script>
import { HubConnectionBuilder } from '@aspnet/signalr';

import Home from './components/Home.vue';
import Canvas from './components/Canvas.vue';

export default {
  name: 'app',
  components: {
    Home,
    Canvas,
  },
  data() {
    return {
      connected: false,
      username: '',
    };
  },
  methods: {
    start(username) {
      this.username = username;
      try {
        const connection = new HubConnectionBuilder().withUrl('/chat').build();
        connection.on('send', (data) => {
          console.log(data);
        });
        connection.start()
          .then(() => connection.invoke('send', 'Hello'));
      } catch (e) {
        console.log(e);
      }
      this.connected = true;
    },
    exit() {
      this.username = '';
      this.connected = false;
    },
  },
};
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
body {
  margin: 0;
  padding: 0;
  color: rgb(76, 76, 76);
}
</style>
