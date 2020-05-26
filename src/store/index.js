import Vue from "vue";
import Vuex from "vuex";
import firebase from "firebase";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    drawer: false,
    user: {}, // ユーザー情報
    input: "", // 入力したメッセージ
    messages: [], // ルーム内のメッセージ
    myRooms: [], // ユーザーが参加済みのルーム
    currentRoomName: "", // 現在のルーム名
    currentRoomId: "", // 現在のルームID
  },
  mutations: {
    setDrawer(state, val) {
      state.drawer = val;
    },
    toggleSideMenu(state) {
      state.drawer = !state.drawer;
    },
    setLoginUser(state, user) {
      state.user = user;
    },
    clearMessages(state) {
      state.messages = [];
    },
    clearMyRooms(state) {
      state.myRooms = [];
    },
    doLogout(state) {
      state.user = {};
    },
    doUpdateInput(state, input) {
      state.input = input;
    },
    addMessage(state, { id, fetchedMessage }) {
      fetchedMessage.id = id;
      // stateのmessagesに取得したメッセージを追加する
      state.messages.push(fetchedMessage);
    },
    doSend(state) {
      state.input = "";
    },
    fetchMyRooms(state, { roomName, roomId }) {
      state.myRooms.push({ roomName, roomId });
    },
    changeCurrentRoomId(state, roomId) {
      state.currentRoomId = roomId;
    },
    changeCurrentRoomName(state, roomName) {
      state.currentRoomName = roomName;
    },
  },
  actions: {
    setDrawer({ commit }, val) {
      commit("setDrawer", val);
    },
    toggleSideMenu({ commit }) {
      commit("toggleSideMenu");
    },
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    doLogout({ commit }) {
      firebase.auth().signOut();
      commit("doLogout");
    },
    // ユーザー情報のセット
    setLoginUser({ commit }, user) {
      commit("setLoginUser", user);
    },
    // stateのmessagesをクリアする
    clearMessages({ commit }) {
      commit("clearMessages");
    },
    // stateのmyRoomsをクリアする
    clearMyRooms({ commit }) {
      commit("clearMyRooms");
    },
    // 入力したメッセージをinputに格納
    doUpdateInput({ commit }, input) {
      commit("doUpdateInput", input);
    },
    // メッセージの送信
    doSend({ getters, commit }) {
      if (getters.uid && getters.input.length) {
        const now = new Date(firebase.firestore.Timestamp.now().seconds * 1000);
        const hours = ("0" + now.getHours()).slice(-2);
        const minutes = ("0" + now.getMinutes()).slice(-2);
        this.timestamp = now;
        this.posttime = `${hours}:${minutes}`; // 投稿時刻
        // firebase にメッセージを追加
        firebase
          .firestore()
          .collection(`rooms/${getters.currentRoomId}/messages`)
          .add({
            message: getters.input,
            name: getters.displayName,
            image: getters.photoURL,
            timestamp: this.timestamp,
            posttime: this.posttime,
            uid: getters.uid,
          });
        commit("doSend");
      }
    },
    // ルームのメッセージを取得
    fetchMessages({ getters, dispatch, commit }) {
      firebase
        .firestore()
        .collection(`rooms/${getters.currentRoomId}/messages`)
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          dispatch("clearMessages");
          snapshot.forEach((doc) =>
            commit("addMessage", { id: doc.id, fetchedMessage: doc.data() })
          );
        });
    },
    // ユーザーが参加済みのルームを取得
    fetchMyRooms({ getters, dispatch, commit }) {
      firebase
        .firestore()
        .collection(`users/${getters.uid}/myRooms`)
        .onSnapshot((snapshot) => {
          dispatch("clearMyRooms");
          snapshot.forEach((doc) => {
            commit("fetchMyRooms", {
              roomName: doc.get("roomName"),
              roomId: doc.get("roomId"),
            });
          });
        });
    },
    // ルームを変更し、変更先のメッセージを取得
    changeRoomAndFetchMessages({ dispatch, commit }, roomId) {
      firebase
        .firestore()
        .collection(`rooms/${roomId}/messages`)
        .orderBy("timestamp", "asc")
        .onSnapshot((snapshot) => {
          dispatch("clearMessages");
          dispatch("changeCurrentRoomName", roomId);
          commit("changeCurrentRoomId", roomId);
          snapshot.forEach((doc) =>
            commit("addMessage", { id: doc.id, fetchedMessage: doc.data() })
          );
        });
    },
    // ルームIDに応じてルーム名を変更
    changeCurrentRoomName({ commit }, roomId) {
      firebase
        .firestore()
        .collection("rooms")
        .doc(roomId)
        .get()
        .then((doc) => {
          commit("changeCurrentRoomName", doc.data().roomName);
        });
    },
  },
  getters: {
    uid: (state) => (state.user ? state.user.uid : ""),
    displayName: (state) => (state.user ? state.user.displayName : ""),
    photoURL: (state) => (state.user ? state.user.photoURL : ""),
    input: (state) => state.input,
    currentRoomId: (state) => state.currentRoomId,
    currentRoomName: (state) => state.currentRoomName,
  },
});
