<template>
  <v-app style="background-color: #fafafa">
    <header>
      <v-app-bar app dark color="#41b883" height="80">
        <!-- ログイン時にサイドバーアイコンと現在のルーム名を表示 -->
        <v-app-bar-nav-icon v-show="uid" @click.stop="toggleSideMenu"></v-app-bar-nav-icon>
        <v-toolbar-title
          class="title"
          v-if="uid && this.$router.currentRoute.name !== 'home'"
        >{{ $store.state.currentRoomName }}</v-toolbar-title>
        <v-spacer></v-spacer>

        <div v-if="uid" key="login" class="d-flex align-center">
          <v-avatar size="40" class="mr-3">
            <img v-if="photoURL" :src="photoURL" />
            <img
              v-if="$store.state.user.isAnonymous"
              src="https://lh3.googleusercontent.com/ogw/ADGmqu95-Y5rL3aQFoJyII44uS-7RKoRDenRcWEqEfQM=s64-c-mo"
            />
          </v-avatar>
          <v-btn @click="doLogout" outlined>ログアウト</v-btn>
        </div>
      </v-app-bar>
    </header>
    <SideNav></SideNav>
    <router-view />
  </v-app>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
import firebase from "firebase";
import SideNav from "./components/SideNav";
export default {
  components: {
    SideNav
  },
  data() {
    return {};
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
        this.$router.push("/", () => {});
      }
    });
  },
  methods: {
    ...mapActions([
      "toggleSideMenu",
      "setLoginUser",
      "doLogout",
      "fetchMyRooms"
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