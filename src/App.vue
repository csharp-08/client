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

function updateQueryStringParameter(uri, key, value) {
  const re = new RegExp(`([?&])${key}=.*?(&|$)`, 'i');
  const separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, `$1${key}=${value}$2`);
  }
  return `${uri + separator + key}=${value}`;
}

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
    async start(username) {
      this.username = username;
      try {
        const url = updateQueryStringParameter('https://localhost:5001/ws-server', 'username', username);
        const connection = new HubConnectionBuilder().withUrl(url).build();
        await connection.start();
        this.setUpServerAPIs(connection);
        console.log('Connected !');
      } catch (e) {
        console.log(e);
      }
      this.connected = true;
    },
    exit() {
      this.username = '';
      this.connected = false;
    },
    setUpServerAPIs(connection) {
      connection.on('drawers', (data) => {
        console.log(data);
      });
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
