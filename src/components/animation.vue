<template>
  <div class="animation-container" ref="container" v-if="show">
    <img :src="`emojis/${emoji}`" alt="emoji" class="bigOne"/>
  </div>
</template>

<script>
export default {
  name: 'animation',
  props: {
    color: {
      type: String,
      default: '#000000',
    },
  },
  computed: {
    emoji() {
      if (!this.colors[this.color]) {
        return null;
      }
      return `${this.colors[this.color]}.png`;
    },
  },
  watch: {
    color: function foo() {
      this.show = true;
      setTimeout(() => {
        this.show = false;
      }, 5 * 1000); // 5s
    },
  },
  data() {
    return {
      show: false,
      colors: {
        '#ff691f': 'lion',
        '#fab81e': 'tiger',
        '#7fdbb6': 'fish',
        '#19cf86': 'frog',
        '#91d2fa': 'dolphin',
        '#1b95e0': 'whale',
        '#abb8c2': 'elephant',
        '#e81c4f': 'octopus',
        '#f58ea8': 'pig',
        '#981ceb': 'unicorn',
        '#ffffff': 'rabbit',
        '#000000': 'wolf',
      },
    };
  },
};
</script>

<style scoped>
.animation-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
.bigOne {
  opacity: 0;
  width: 50vh;
  height: 50vh;
  animation: grow 3s ease-in-out, shake 1.5s cubic-bezier(.36,.07,.19,.97) both 3, hide 3.2s ease-out;
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000px;
}

@keyframes grow {
  0%   {
    width: 0;
    height: 0;
    display: block;
  }
  100% {
    opacity: 0;
    width: 50vh;
    height: 50vh;
    display: none;
  }
}

@keyframes hide {
  0% { opacity: 1; }
  80% { opacity: 1; }
  100% { opacity: 0; }
}

@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
  }

  20%, 80% {
    transform: translate3d(2px, 0, 0);
  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
  }
}
</style>
