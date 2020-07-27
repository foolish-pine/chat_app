import {
  Module,
  VuexModule,
  Mutation,
  Action,
  getModule,
} from "vuex-module-decorators";
import store from "@/store";
import router from "@/router";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { FetchedMessage } from "../modules/types";

let unsubscribe: any; // firestore.collection().onSnapshot()を格納する（リスナーのデタッチ用）

@Module({ dynamic: true, store, name: "AppModule", namespaced: true })
class AppModule extends VuexModule {
  drawer: boolean = false;
  user: firebase.User | null = null; // ユーザー情報
  myRooms: { roomName: string; roomId: string }[] = []; // ユーザーが参加済みのルーム
  currentRoomName: string = ""; // 現在のルーム名
  currentRoomId: string = ""; // 現在のルームID
  messages: Map<string, FetchedMessage[]> = new Map(); // ルーム内のメッセージ;

  get uid(): string {
    return this.user ? this.user.uid : "";
  }

  get displayName(): string | null {
    return this.user ? this.user.displayName : null;
  }

  get photoURL(): string | null {
    return this.user ? this.user.photoURL : null;
  }

  @Mutation
  toggleSideMenu() {
    this.drawer = !this.drawer;
  }

  @Mutation
  setToggleSideMenu(value: boolean) {
    this.drawer = value;
  }

  @Mutation
  setLoginUser(user: firebase.User) {
    this.user = user;
  }

  @Mutation
  clearMessages() {
    this.messages = new Map();
  }

  @Mutation
  clearMyRooms() {
    this.myRooms = [];
  }

  @Mutation
  doLogout() {
    this.user = null;
    this.myRooms = [];
    this.currentRoomName = "";
    this.currentRoomId = "";
    this.messages = new Map();
  }

  @Mutation
  addMessage({ fetchedMessage }: { fetchedMessage: FetchedMessage }) {
    const date: Date =
      fetchedMessage.timestamp && fetchedMessage.timestamp!.toDate();
    const dateString: string = date && date.toLocaleDateString();
    const hours: string = date && String(date.getHours());
    const minutes: string = date && ("0" + date.getMinutes()).slice(-2);
    if (hours !== null && minutes !== null)
      // 投稿時刻
      fetchedMessage.posttime = `${hours}:${minutes}`;
    // stateのmessagesに取得したメッセージを追加する
    if (dateString !== null)
      this.messages.has(dateString)
        ? this.messages.get(dateString)!.push(fetchedMessage)
        : this.messages.set(dateString, [fetchedMessage]);
  }

  @Mutation
  fetchMyRooms({ roomName, roomId }: { roomName: string; roomId: string }) {
    this.myRooms.push({ roomName, roomId });
  }

  @Mutation
  updateCurrentRoomNameAndId({
    roomName,
    roomId,
  }: {
    roomName: string;
    roomId: string;
  }) {
    this.currentRoomName = roomName;
    this.currentRoomId = roomId;
  }

  @Action
  toggleSideMenuAction() {
    this.toggleSideMenu();
  }

  @Action
  setToggleSideMenuAction(value: boolean) {
    this.setToggleSideMenu(value);
  }

  @Action
  doLoginAction() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
  }

  @Action
  doAnonymousLoginAction() {
    firebase
      .auth()
      .signInAnonymously()
      .catch(() => {});
  }

  @Action
  doLogoutAction() {
    firebase.auth().signOut();
    this.doLogout();
    this.toggleSideMenu();
  }

  // ユーザー情報のセット
  @Action
  setLoginUserAction(user: firebase.User) {
    this.setLoginUser(user);
    this.fetchMyRoomsAction();
  }

  // stateのmessagesをクリアする
  @Action
  clearMessagesAction() {
    this.clearMessages();
  }

  // stateのmyRoomsをクリアする
  @Action
  clearMyRoomsAction() {
    this.clearMyRooms();
  }

  // メッセージの送信
  @Action
  doSendAction(input: string) {
    if (this.uid && input.length) {
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      // firebase にメッセージを追加
      firebase
        .firestore()
        .collection(`rooms/${this.currentRoomId}/messages`)
        .add({
          message: input,
          name: this.displayName,
          image: this.photoURL,
          timestamp: timestamp,
          uid: this.uid,
        });
    }
  }

  // 新しいルームを作成する
  @Action
  makeNewRoomAction({
    newRoomName,
    newRoomId,
    newRoomPassword,
  }: {
    newRoomName: string;
    newRoomId: string;
    newRoomPassword: string;
  }) {
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
          .collection(`users/${this.uid}/myRooms`)
          .doc(newRoomId)
          .set({
            roomName: newRoomName,
            roomId: newRoomId,
          });
      })
      .then(() => {
        this.changeRoomAndFetchMessagesAction({
          roomName: newRoomName,
          roomId: newRoomId,
        });
        router.push(
          {
            name: "room",
            params: { roomId: newRoomId },
          },
          () => {}
        );
      })
      .catch(() => {});
  }

  // ルームに参加する
  @Action
  joinRoomAction({
    searchedId,
    searchedRoomPassword,
  }: {
    searchedId: string;
    searchedRoomPassword: string;
  }) {
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
              const roomName = doc.get("roomName");
              const roomId = doc.get("roomId");

              firebase
                .firestore()
                .collection(`users/${this.uid}/myRooms`)
                .doc(searchedId)
                .set({
                  roomName: roomName,
                  roomId: roomId,
                })
                .then(() => {
                  this.changeRoomAndFetchMessagesAction({ roomName, roomId });
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
  }

  // ルームを変更し、変更先のメッセージを取得
  @Action
  changeRoomAndFetchMessagesAction({
    roomName,
    roomId,
  }: {
    roomName: string;
    roomId: string;
  }) {
    // 変更前のルームのonSnapShotリスナーをデタッチする
    if (unsubscribe) unsubscribe();
    this.updateCurrentRoomNameAndIdAction({ roomName, roomId });
    unsubscribe = firebase
      .firestore()
      .collection(`rooms/${roomId}/messages`)
      .orderBy("timestamp", "asc")
      .onSnapshot(
        (snapshot) => {
          this.clearMessages();
          snapshot.forEach((doc) =>
            this.addMessage({
              fetchedMessage: {
                id: doc.id,
                name: doc.get("name"),
                uid: doc.get("uid"),
                image: doc.get("image"),
                message: doc.get("message"),
                timestamp: doc.get("timestamp"),
              },
            })
          );
        },
        () => {}
      );
  }

  // ルームIDに応じてcurrentRoomNameとcurrentRoomIdを更新
  @Action
  updateCurrentRoomNameAndIdAction({
    roomName,
    roomId,
  }: {
    roomName: string;
    roomId: string;
  }) {
    this.updateCurrentRoomNameAndId({
      roomName: roomName,
      roomId: roomId,
    });
  }

  // ユーザーが参加済みのルームを取得
  @Action
  fetchMyRoomsAction() {
    firebase
      .firestore()
      .collection(`users/${this.uid}/myRooms`)
      .onSnapshot(
        (snapshot) => {
          this.clearMyRooms();
          snapshot.forEach((doc) => {
            this.fetchMyRooms({
              roomName: doc.get("roomName"),
              roomId: doc.get("roomId"),
            });
          });
        },
        () => {}
      );
  }

  // 現在のルームから退出する
  @Action
  exitRoomAction() {
    firebase
      .firestore()
      .collection(`users/${this.uid}/myRooms`)
      .doc(this.currentRoomId)
      .delete()
      .then(() => {
        router.push(
          {
            name: "home",
          },
          () => {}
        );
        this.updateCurrentRoomNameAndId({
          roomName: "",
          roomId: "",
        });
      });
  }
}

export default getModule(AppModule);
