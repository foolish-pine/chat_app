<template>
  <v-app style="background-color: #fafafa">
    <HeaderItem></HeaderItem>
    <SideNav></SideNav>
    <router-view />
  </v-app>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import * as firebase from "firebase/app";
import "firebase/auth";
import HeaderItem from "./components/HeaderItem.vue";
import SideNav from "./components/SideNav.vue";
import AppModule from "./store/modules/app";

@Component({
  components: {
    HeaderItem,
    SideNav
  }
})
export default class App extends Vue {
  created() {
    firebase.auth().onAuthStateChanged((user: firebase.User | null) => {
      if (user) {
        // ログイン後ユーザー情報をセットし、参加済みのルームを取得する
        AppModule.setLoginUserAction(user);
        if (this.$router.currentRoute.name !== "home") {
          this.$router.push({ name: "home" }, () => {});
        }
      } else {
        this.$router.push({ name: "home" }, () => {});
      }
    });
  }
}
</script>

<style lang="scss">
.container {
  max-width: 700px !important;
  width: 100% !important;
}
</style>