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
    messages: []
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
    clearMessages (state) {
      state.messages = [];
    },
    doLogout (state) {
      state.user = {};
    },
    doUpdateInput (state, {input}) {
      state.input = input;
    },
    addMessage (state, { id, message }) {
      message.id = id
      state.messages.push(message)
    },
    doSend (state) {
      state.input = ""; // フォームを空にする
    },
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
    clearMessages ({commit}) {
      commit('clearMessages');
    },
    doUpdateInput ({commit}, {input}) {
      commit('doUpdateInput', {input});
    },
    doSend ({getters, commit}) {
      if (getters.uid && getters.input.length) {
        const now = new Date();
        const hours = ("0" + now.getHours()).slice(-2);
        const minutes = ("0" + now.getMinutes()).slice(-2);
        this.timestamp = now.getTime();
        this.posttime = `${hours}:${minutes}`;
        // firebase にメッセージを追加
        firebase.firestore().collection(`users/${getters.uid}/rooms/1/messages`)
          .add(
            {
              message: getters.input,
              name: getters.displayName,
              image: getters.photoURL,
              timestamp: this.timestamp,
              posttime: this.posttime,
              uid: getters.uid
            }
          );
      commit('doSend');
      }
    },
    fetchMessages ({getters, commit}) {
      firebase.firestore().collection(`users/${getters.uid}/rooms/1/messages`).orderBy('timestamp', 'asc').onSnapshot(snapshot => {
        snapshot.forEach(doc => commit('addMessage',  { id: doc.id, message:  doc.data() }))
      })
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
