<template>
  <v-app>
    <header>
      <v-app-bar app dark color="#41b883" height="80">
        <!-- ログイン時にサイドバーアイコンと現在のルーム名を表示 -->
        <v-app-bar-nav-icon v-show="$store.state.user.uid" @click.stop="toggleSideMenu"></v-app-bar-nav-icon>
        <v-toolbar-title class="title" v-if="$store.state.user.uid">{{ $store.state.currentRoomName }}</v-toolbar-title>
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
        // ログイン後ユーザー情報をセットし、参加済みのルームを取得する
        this.setLoginUser(user);
        this.fetchMyRooms();
        if (this.$router.currentRoute.name !== "home") {
          this.$router.push({ name: "home" });
        }
      } else {
        this.doLogout(user);
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
      "fetchMyRooms"
    ])
  },
  computed: {
    ...mapGetters(["uid", "photoURL", "currentRoomId"]),
  }
};
</script>

<style lang="scss">
.container {
  max-width: 700px !important;
  width: 100% !important;
}
</style>