<template>
  <div class="container">
    <h1 class="">
      Bienvenue sur le WhiteBoard Collaboratif !
    </h1>
    <form @submit.prevent="submit">
      <label for="name">Entrez votre surnom:</label>
      <input id="name"
             autocomplete="off"
             v-model="username"
             :class="{ invalid: invalidInput }"
             placeholder="Surnom..."
             @focus="invalidInput = false"
      />
      <button>Commencer</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      username: '',
      invalidInput: false,
    };
  },
  methods: {
    submit() {
      if (!/\w/gmi.test(this.username)) {
        this.invalidInput = false;
        setTimeout(() => {
          this.invalidInput = true;
        }, 50);
        return;
      }
      console.log(`Your name is ${this.username}`);
      this.$emit('start', this.username);
    },
  },
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}

.container > form {
  display: flex;
  flex-direction: column;
  width: 400px;
}

.container > form > * {
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

input {
  padding: 0.6rem 1.2rem;
  border: 1px solid #afafaf;
  border-radius: 2rem;
  outline: none;
  color: rgb(76, 76, 76);
}

input:focus {
  border: 1px solid #7c7c7c;
}

input.invalid {
  border: 1px solid #7c2328;
  transform: translate3d(0, 0, 0);
  animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;
  perspective: 1000px;
}

button {
  outline: none;
  background-color: #2298b9;
  color: #fff;
  cursor: pointer;
  border-radius: 2rem;
  border: none;
  padding: 0.6rem 1.2rem;
}

button:hover, button:focus {
  background-color: #217e9e;
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
