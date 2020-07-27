<template>
  <v-content class="fv">
    <v-container text-center justify-center>
      <h1 class="display-2 mb-10">Pine's Chat App</h1>
      <template v-if="isLoginButtonShow">
        <div class="align-center mb-5">
          <v-btn @click="doAnonymousLogin" large dark color="#41b883">匿名でログイン</v-btn>
        </div>
        <div class="align-center">
          <v-btn @click="doLogin" large dark color="#41b883">Googleアカウントでログイン</v-btn>
        </div>
      </template>
    </v-container>
  </v-content>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as firebase from "firebase/app";
import "firebase/auth";
import AppModule from "../store/modules/app";

@Component
export default class Home extends Vue {
  isLoginButtonShow: boolean = false;

  created() {
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      user ? (this.isLoginButtonShow = false) : (this.isLoginButtonShow = true);
    });
  }

  doLogin() {
    AppModule.doLoginAction();
  }

  doAnonymousLogin() {
    AppModule.doAnonymousLoginAction();
  }
}
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
