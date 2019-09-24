<template>
  <div class="container">
    <h1 class="">
      Bienvenue sur le WhiteBoard Collaboratif !
    </h1>
    <form @submit.prevent="submit">
      <label for="name">Entrez votre surnom:</label>
      <input id="name" v-model="surname" placeholder="Surnom..."/>
      <button>Commencer</button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data() {
    return {
      surname: '',
    };
  },
  methods: {
    submit() {
      console.log(`Your name is ${this.surname}`);
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
  padding: 0.2rem 0.4rem;
  border: 1px solid #afafaf;
  border-radius: 5px;
  outline: none;
  color: rgb(76, 76, 76);
}

input:focus {
  border: 1px solid #7c7c7c;
}

button {
  outline: none;
  background-color: #217e9e;
  color: #fff;
  cursor: pointer;
}
</style>
