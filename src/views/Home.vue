<template>
  <v-content class="fv">
    <v-container text-center justify-center>
      <h1 class="display-2 mb-10">Pine's Chat App</h1>
      <div v-if="!uid" class="align-center mb-5">
        <v-btn @click="doAnonymousLogin" large dark color="#41b883">匿名でログイン</v-btn>
      </div>
      <div v-if="!uid" class="align-center">
        <v-btn @click="doLogin" large dark color="#41b883">Googleアカウントでログイン</v-btn>
      </div>
    </v-container>
  </v-content>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import firebase from "firebase";

export default {
  name: "Home",
  components: {},
  created() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        if (this.$router.currentRoute.name !== "home") {
          this.$router.push({ name: "home" });
        }
      }
    });
  },
  methods: {
    ...mapActions(["doLogin", "doAnonymousLogin", "setLoginUser"])
  },
  computed: {
    ...mapGetters(["uid"])
  }
};
</script>

<style lang="scss" scoped>
.fv {
  width: 100%;
  max-width: 100vw;
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}
h1 {
  text-align: center;
}
</style>
