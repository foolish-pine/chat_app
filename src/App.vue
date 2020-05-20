<template>
  <v-app>
    <header>
      <v-app-bar app dark color="#41b883" height="80">
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
    <router-view />
  </v-app>
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import firebase from "firebase";
// 改行を <br> タグに変換するモジュール
export default {
  data() {
    return {};
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      const ref_message = firebase.database().ref("message");
      if (user) {
        this.setLoginUser(user);
        this.clearChat();
        // message に変更があったときのハンドラを登録
        ref_message.limitToLast(100).on("child_added", this.childAdded);
        if (this.$router.currentRoute.name === "home")
          this.$router.push({ name: "chat" });
      } else {
        // message に変更があったときのハンドラを解除
        ref_message.limitToLast(100).off("child_added", this.childAdded);
        this.$router.push({ name: "home" });
      }
    });
  },
  methods: {
    ...mapActions([
      "setLoginUser",
      "doLogin",
      "doLogout",
      "clearChat",
      "childAdded"
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
.chat-item {
  max-width: 75%;
  width: 100%;
}
textarea {
  overflow: hidden;
}
</style>