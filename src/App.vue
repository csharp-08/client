<template>
  <div id="app">
    <Canvas v-if="connected" :id="id" :connection="connection" :users="users" @exit="exit"></Canvas>
    <Home @start="start($event)" v-else ></Home>
    <flash-message class="flash-container" transitionName="fade"></flash-message>
  </div>
</template>

<script>
import { HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import 'vue-flash-message/dist/vue-flash-message.min.css';

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
      connection: null,
      username: '',
      users: {},
      id: '',
    };
  },
  methods: {
    async start({ username, lobby }) {
      this.username = username;
      try {
        let url = updateQueryStringParameter(`${process.env.VUE_APP_BASE_URL}/ws-server`, 'username', username);
        url = updateQueryStringParameter(url, 'lobby', lobby);

        if (localStorage.id) {
          const sessionId = localStorage.id;
          url = updateQueryStringParameter(url, 'sessionId', sessionId);
          this.id = sessionId;
          localStorage.id = sessionId;
        }
        this.connection = new HubConnectionBuilder().withUrl(url).withAutomaticReconnect().build();
        await this.connection.start();
        this.setUpServerAPIs(this.connection);
        console.log('Connected !');

        localStorage.username = username;
        localStorage.lobby = lobby;
        this.connected = true;
      } catch (e) {
        this.flash('Erreur, connexion impossible avec le serveur...', 'error', {
          timeout: 30 * 1000, // 30 seconds
        });
        console.log(e);
        this.connected = false;
      }
    },
    exit() {
      this.username = '';
      this.connected = false;
    },
    setUpServerAPIs(connection) {
      connection.on('drawers', (users) => {
        this.users = JSON.parse(users);
      });
      connection.on('ID', (id) => {
        this.id = id;
        localStorage.id = id;
      });
      connection.onreconnecting((error) => {
        console.assert(connection.state === HubConnectionState.Reconnecting);
        console.log(`Connection lost due to error "${error}". Reconnecting.`);
      });
      connection.onreconnected((connectionId) => {
        console.assert(connection.state === HubConnectionState.Reconnecting);
        console.log(`Reconnected with id: "${connectionId}"`);
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
.flash-container {
  position: fixed;
  top: 60px;
  left: 10vw;
  z-index: 100;
  width: 80vw;
}
.fade-enter-active, .fade-leave-active, .fade-move {
  transition: 500ms cubic-bezier(0.59, 0.12, 0.34, 0.95);
  transition-property: opacity, transform;
}
.fade-leave-active {
  position: absolute;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.fade-leave-to {
  opacity: 0;
  transform: scaleY(0);
  transform-origin: center top;
}
.fade-enter-to {
  opacity: 1;
}
.flash__wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.flash__message {
  display: block;
}
</style>
