<template>
  <v-app>
    <header>
      <v-app-bar app dark color="#41b883" height="80">
        <v-toolbar-title class="title">Pine's Chat App</v-toolbar-title>
        <v-spacer></v-spacer>

        <!-- ログイン時にはフォームとログアウトボタンを表示 -->
        <div v-if="user.uid" key="login" class="d-flex align-center">
          <v-avatar size="40" class="mr-4">
            <img :src="user.photoURL" />
          </v-avatar>
          <v-btn @click="doLogout" outlined>ログアウト</v-btn>
        </div>
        <!-- 未ログイン時にはログインボタンを表示 -->
        <div v-else key="logout">
          <v-btn @click="doLogin" outlined>ログイン</v-btn>
        </div>
      </v-app-bar>
    </header>
    <!--Firebase から取得したリストを描画（トランジション付き）-->
    <v-content>
      <v-container class="container">
        <transition-group name="chat" tag="div" class="list content">
          <section
            v-for="{ key, name, image, message, time } in chat"
            :key="key"
            class="d-flex mb-4"
          >
            <v-avatar size="40" class="mr-2">
              <img :src="image" width="40" height="40" />
            </v-avatar>
            <div>
              <div class="body-2">{{ name }}</div>
              <div class="d-flex align-end">
                <v-card outlined color="#f0ffe0" class="body-1 px-2 py-1">
                  <nl2br tag="div" :text="message" />
                </v-card>
                <div class="overline ml-2">{{ time }}</div>
              </div>
            </div>
          </section>
        </transition-group>
      </v-container>
    </v-content>
    <v-footer app color="#f5f5f5" height="120">
      <v-spacer></v-spacer>
      <!-- 入力フォーム -->
      <v-form action @submit.prevent="doSend" class="d-flex align-center container">
        <v-text-field
          v-model="input"
          :disabled="!user.uid"
          @keydown.enter.exact.prevent="doSend"
          class="mr-2"
          clearable
        ></v-text-field>
        <v-btn type="submit" :disabled="!user.uid || submitButtonDisabled" color="primary" small>送信</v-btn>
      </v-form>
      <v-spacer></v-spacer>
    </v-footer>
    <router-view />
  </v-app>
</template>

<script>
// firebase モジュール
import firebase from "firebase";
// 改行を <br> タグに変換するモジュール
import Nl2br from "vue-nl2br";
export default {
  components: { Nl2br },
  data() {
    return {
      user: {}, // ユーザー情報
      chat: [], // 取得したメッセージを入れる配列
      input: "" // 入力したメッセージ
    };
  },
  created() {
    firebase.auth().onAuthStateChanged(user => {
      this.user = user ? user : {};
      const ref_message = firebase.database().ref("message");
      if (user) {
        this.chat = [];
        // message に変更があったときのハンドラを登録
        ref_message.limitToLast(100).on("child_added", this.childAdded);
      } else {
        // message に変更があったときのハンドラを解除
        ref_message.limitToLast(100).off("child_added", this.childAdded);
      }
    });
  },
  methods: {
    // ログイン処理
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    // ログアウト処理
    doLogout() {
      firebase.auth().signOut();
      this.$router.push({ name: "home" }, () => {})
    },
    // スクロール位置を一番下に移動
    scrollBottom() {
      this.$nextTick(() => {
        window.scrollTo(0, document.body.clientHeight);
      });
    },
    // 受け取ったメッセージをchatに追加
    // データベースに新しい要素が追加されると随時呼び出される
    childAdded(snap) {
      const message = snap.val();
      this.chat.push({
        key: snap.key,
        name: message.name,
        image: message.image,
        message: message.message,
        time: message.time
      });
      this.scrollBottom();
    },
    doSend() {
      if (this.user.uid && this.input.length) {
        const now = new Date();
        const hours = ("0" + now.getHours()).slice(-2);
        const minutes = ("0" + now.getMinutes()).slice(-2);
        this.time = `${hours}:${minutes}`;
        // firebase にメッセージを追加
        firebase
          .database()
          .ref("message")
          .push(
            {
              message: this.input,
              name: this.user.displayName,
              image: this.user.photoURL,
              time: this.time
            },
            () => {
              this.input = ""; // フォームを空にする
            }
          );
      }
    }
  }
};
</script>

<style lang="scss">
.container {
  max-width: 700px !important;
  width: 100% !important;
}
</style>