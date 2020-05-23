import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    drawer: false,
    user: {}, // ユーザー情報
    input: "", // 入力したメッセージ
    messages: [],
    myRooms: [],
    currentRoomId: ""
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
    clearMyRooms (state) {
      state.myRooms = [];
    },
    doLogout (state) {
      state.user = {};
    },
    doUpdateInput (state, {input}) {
      state.input = input;
    },
    addMessage (state, { id, fetchedMessage }) {
      fetchedMessage.id = id
        state.messages.push(fetchedMessage)
    },
    doSend (state) {
      state.input = ""; // フォームを空にする
    },
    fetchMyRooms (state, {name, roomId}) {
      state.myRooms.push({name, roomId})
    },
    changeCurrentRoomId (state, roomId) {
      state.currentRoomId = roomId
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
    clearMyRooms ({commit}) {
      commit('clearMyRooms');
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
        firebase.firestore().collection(`rooms/${getters.currentRoomId}/messages`)
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
    fetchMessages ({getters, dispatch, commit}) {
        firebase.firestore().collection(`rooms/${getters.currentRoomId}/messages`).orderBy('timestamp', 'asc').onSnapshot(snapshot => {
          dispatch('clearMessages')
          snapshot.forEach(doc => commit('addMessage',  { id: doc.id, fetchedMessage:  doc.data() }))
        })
    },
    fetchMyRooms ({getters, dispatch, commit}) {
        firebase.firestore().collection(`rooms`)
        .onSnapshot(snapshot => {
          dispatch('clearMyRooms')
          snapshot.forEach(doc => {
            if (doc.get('members').includes(getters.uid)) {
              commit('fetchMyRooms', { name: doc.get('name'), roomId: doc.get('roomId')})
            }
          })
        })
    },
    joinAnoterRoom ({getters}, searchedId) {
        firebase.firestore().collection(`rooms`)
        .onSnapshot(snapshot => {
          snapshot.forEach(doc => {
            if (doc.get('roomId') === searchedId) {
              firebase.firestore().collection(`rooms`).doc(doc.get('roomId')).update({
                members: firebase.firestore.FieldValue.arrayUnion(getters.uid)
              })
            }
          })
        })
    },
    changeRoomAndFetchMessages ({dispatch, commit}, roomId) {
      firebase.firestore().collection(`rooms/${roomId}/messages`).orderBy('timestamp', 'asc').onSnapshot(snapshot => {
        dispatch('clearMessages')
        commit('changeCurrentRoomId', roomId)
        snapshot.forEach(doc => commit('addMessage', { id: doc.id, fetchedMessage:  doc.data() }))
      })
    },
  },
  getters: {
    uid: state => state.user ? state.user.uid : "",
    displayName: state => state.user ? state.user.displayName : "",
    photoURL: state => state.user ? state.user.photoURL : "",
    input: state => state.input,
    currentRoomId: state => state.currentRoomId,
  }
});
