<template>
  <v-app>
    <header>
      <v-app-bar app dark color="#41b883" height="80">
        <v-app-bar-nav-icon @click.stop="toggleSideMenu"></v-app-bar-nav-icon>
        <v-toolbar-title class="title">Pine's Chat App</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- ログイン時にはフォームとログアウトボタンを表示 -->
        <div v-if="uid" key="login" class="d-flex align-center">
          <v-avatar size="40" class="mr-3">
            <img :src="photoURL" />
          </v-avatar>
          <v-btn @click="doLogout" outlined>ログアウト</v-btn>
        </div>
        <!-- 未ログイン時にはログインボタンを表示 -->
        <div v-else key="logout">
          <v-btn @click="doLogin" outlined>ログイン</v-btn>
        </div>
      </v-app-bar>
    </header>
    <SideNav></SideNav>
    <router-view />
  </v-app>
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import firebase from "firebase";
import SideNav from "./components/SideNav";
// 改行を <br> タグに変換するモジュール
export default {
  components: {
    SideNav
  },
  data() {
    return {
    };
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.setLoginUser(user);
        this.clearMessages().then(this.fetchMessages())
        if (this.$router.currentRoute.name === "home")
          this.$router.push({ name: "room", params: { room_id: 1 } });
      } else {
        // message に変更があったときのハンドラを解除
        this.doLogout(user)
        this.$router.push({ name: "home" });
      }
    });
  },
  methods: {
    ...mapActions([
      "toggleSideMenu",
      "setLoginUser",
      "doLogin",
      "doLogout",
      "fetchMessages",
      "clearMessages"
    ])
  },
  computed: {
    ...mapGetters(["uid", "photoURL"])
  }
};
</script>

<style lang="scss">
.container {
  max-width: 700px !important;
  width: 100% !important;
}
</style>