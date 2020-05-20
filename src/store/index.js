import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    drawer: false,
    user: {}, // ユーザー情報
    input: "", // 入力したメッセージ
    chat: [], // 取得したメッセージを入れる配列
  },
  mutations: {
    setDrawer(state, val) {
      state.drawer = val;
    },
    toggleSideMenu(state) {
      state.drawer = !state.drawer;
    },
    setLoginUser (state, user) {
      state.user = user;
    },
    doLogout (state) {
      state.user = {};
    },
    clearChat (state) {
      state.chat = [];
    },
    doUpdateInput (state, {input}) {
      state.input = input;
    },
    doSend (state) {
      if (state.user.uid && state.input.length) {
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
              message: state.input,
              name: state.user.displayName,
              image: state.user.photoURL,
              time: this.time,
              uid: state.user.uid
            },
            () => {
              state.input = ""; // フォームを空にする
            }
          );
      }
    },
    // 受け取ったメッセージをchatに追加
    // データベースに新しい要素が追加されると随時呼び出される
    childAdded(state, snap) {
      const message = snap.val();
      state.chat.push({
        key: snap.key,
        name: message.name,
        image: message.image,
        message: message.message,
        time: message.time,
        chatUid: message.uid
      })
    }
  },
  actions: {
    setDrawer({ commit }, val) {
      commit("setDrawer", val);
    },
    toggleSideMenu({ commit }) {
      commit("toggleSideMenu");
    },
    // ログイン処理
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    // ログアウト処理
    doLogout({commit}) {
      firebase.auth().signOut();
      commit("doLogout");
    },
    setLoginUser ({commit}, user) {
      commit('setLoginUser', user);
    },
    clearChat ({commit}) {
      commit('clearChat');
    },
    doUpdateInput ({commit}, {input}) {
      commit('doUpdateInput', {input});
    },
    doSend ({commit}) {
      commit('doSend');
    },
    childAdded ({commit}, snap) {
      commit('childAdded', snap);
    }
  },
  getters: {
    uid: state => state.user ? state.user.uid : "",
    displayName: state => state.user ? state.user.displayName : "",
    photoURL: state => state.user ? state.user.photoURL : "",
    input: state => state.input,
    chat: state => state.chat,
  }
});
