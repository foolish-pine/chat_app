import Vue from "vue";
import Vuex from "vuex";
import router from "../router/index";
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
    clearInput(state) {
      state.input = "";
    },
    fetchMyRooms(state, { roomName, roomId }) {
      state.myRooms.push({ roomName, roomId });
    },
    updateCurrentRoomNameAndId(state, { roomName, roomId }) {
      state.currentRoomName = roomName;
      state.currentRoomId = roomId;
    },
  },
  actions: {
    toggleSideMenu({ commit }) {
      commit("toggleSideMenu");
    },
    doLogin() {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider);
    },
    doAnonymousLogin() {
      firebase
        .auth()
        .signInAnonymously()
        .catch((error) => {
          console.log(alert(error.message));
        });
    },
    doLogout({ commit }) {
      firebase.auth().signOut();
      commit("doLogout");
      commit("toggleSideMenu");
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
        const timestamp = now;
        const posttime = `${hours}:${minutes}`; // 投稿時刻
        // firebase にメッセージを追加
        firebase
          .firestore()
          .collection(`rooms/${getters.currentRoomId}/messages`)
          .add({
            message: getters.input,
            name: getters.displayName,
            image: getters.photoURL,
            timestamp: timestamp,
            posttime: posttime,
            uid: getters.uid,
          });
        commit("clearInput");
      }
    },
    // 新しいルームを作成する
    makeNewRoom(
      { getters, dispatch },
      { newRoomName, newRoomId, newRoomPassword }
    ) {
      firebase
        .firestore()
        .collection("rooms")
        .doc(newRoomId)
        .set({
          roomName: newRoomName,
          roomId: newRoomId,
          roomPassword: newRoomPassword,
        })
        .then(() => {
          firebase
            .firestore()
            .collection(`users/${getters.uid}/myRooms`)
            .doc(newRoomId)
            .set({
              roomName: newRoomName,
              roomId: newRoomId,
            });
        })
        .then(() => {
          dispatch("changeRoomAndFetchMessages", newRoomId);
          router.push(
            {
              name: "room",
              params: { roomId: newRoomId },
            },
            () => {}
          );
        })
        .catch(() => {});
    },
    // ルームに参加する
    joinRoom({ getters, dispatch }, { searchedId, searchedRoomPassword }) {
      firebase
        .firestore()
        .collection("rooms")
        .get()
        .then(
          (snapshot) => {
            snapshot.forEach((doc) => {
              if (
                doc.get("roomId") === searchedId &&
                doc.get("roomPassword") === searchedRoomPassword
              ) {
                firebase
                  .firestore()
                  .collection(`users/${getters.uid}/myRooms`)
                  .doc(searchedId)
                  .set({
                    roomName: doc.get("roomName"),
                    roomId: doc.get("roomId"),
                  })
                  .then(() => {
                    dispatch("changeRoomAndFetchMessages", searchedId);
                    router.push(
                      {
                        name: "room",
                        params: { roomId: searchedId },
                      },
                      () => {}
                    );
                  });
              }
            });
          },
          () => {}
        );
    },
    // ルームを変更し、変更先のメッセージを取得
    changeRoomAndFetchMessages({ dispatch, commit }, roomId) {
      dispatch("updateCurrentRoomNameAndId", roomId);
      firebase
        .firestore()
        .collection(`rooms/${roomId}/messages`)
        .orderBy("timestamp", "asc")
        .onSnapshot(
          (snapshot) => {
            dispatch("clearMessages");
            snapshot.forEach((doc) =>
              commit("addMessage", { id: doc.id, fetchedMessage: doc.data() })
            );
          },
          () => {}
        );
    },
    // ルームIDに応じてcurrentRoomNameとcurrentRoomIdを更新
    updateCurrentRoomNameAndId({ commit }, roomId) {
      firebase
        .firestore()
        .collection("rooms")
        .doc(roomId)
        .get()
        .then((doc) => {
          commit("updateCurrentRoomNameAndId", {
            roomName: doc.data().roomName,
            roomId: doc.data().roomId,
          });
        });
    },
    // ルームのメッセージを取得
    fetchMessages({ getters, dispatch, commit }) {
      firebase
        .firestore()
        .collection(`rooms/${getters.currentRoomId}/messages`)
        .orderBy("timestamp", "asc")
        .onSnapshot(
          (snapshot) => {
            dispatch("clearMessages");
            snapshot.forEach((doc) =>
              commit(
                "addMessage",
                { id: doc.id, fetchedMessage: doc.data() },
                () => {}
              )
            );
          },
          () => {}
        );
    },
    // ユーザーが参加済みのルームを取得
    fetchMyRooms({ getters, dispatch, commit }) {
      firebase
        .firestore()
        .collection(`users/${getters.uid}/myRooms`)
        .onSnapshot(
          (snapshot) => {
            dispatch("clearMyRooms");
            snapshot.forEach((doc) => {
              commit("fetchMyRooms", {
                roomName: doc.get("roomName"),
                roomId: doc.get("roomId"),
              });
            });
          },
          () => {}
        );
    },
    // 現在のルームから退出する
    exitRoom({ getters, commit }) {
      firebase
        .firestore()
        .collection(`users/${getters.uid}/myRooms`)
        .doc(getters.currentRoomId)
        .delete()
        .then(() => {
          router.push(
            {
              name: "home",
            },
            () => {}
          );
          commit("updateCurrentRoomNameAndId", {
            roomName: "",
            roomId: "",
          });
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
