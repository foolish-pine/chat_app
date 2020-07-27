<template>
  <v-navigation-drawer v-model="drawer" fixed temporary>
    <v-list>
      <v-list-item>
        <v-list-item-avatar>
          <!-- ユーザーのアバターを表示 -->
          <img v-if="photoURL" :src="photoURL" />
          <img v-else src="../assets/anonymous-avatar.png" />
        </v-list-item-avatar>
        <v-list-item-content>
          <!-- ユーザー名を表示 -->
          <v-list-item-title v-if="displayName">{{ displayName }}</v-list-item-title>
          <v-list-item-title v-else>ゲストさん</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <!-- ルームの新規作成ボタンとダイアログ -->
      <v-dialog v-model="newDialog" max-width="600px">
        <template v-slot:activator="{ on }">
          <v-list-item v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>New</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-card class="pa-5">
          <v-card-title>
            <span class="headline">New Talk Room</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field label="Room Name" v-model="newRoomName" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Room ID" v-model="newRoomId" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Room Password"
                    v-model="newRoomPassword"
                    :append-icon="showMakeRoomPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showMakeRoomPassword = !showMakeRoomPassword"
                    :type="showMakeRoomPassword ? 'text' : 'password'"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="subtitle-1" color="blue darken-1" text @click="newDialog = false">Close</v-btn>
            <v-btn
              class="subtitle-1"
              color="blue darken-1"
              text
              @click="makeNewRoom(newRoomName, newRoomId, newRoomPassword)"
            >Make</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- ルームの参加ボタンとダイアログ -->
      <v-dialog v-model="joinDialog" max-width="600px">
        <template v-slot:activator="{ on }">
          <v-list-item v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-account-arrow-right</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>Join</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
        <v-card class="pa-5">
          <v-card-title>
            <span class="headline">Join</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field label="Room ID" v-model="searchedId" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Room Password"
                    :append-icon="showJoinRoomPassword ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showJoinRoomPassword = !showJoinRoomPassword"
                    :type="showJoinRoomPassword ? 'text' : 'password'"
                    v-model="searchedRoomPassword"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn class="subtitle-1" color="blue darken-1" text @click="joinDialog = false">Close</v-btn>
            <v-btn
              class="subtitle-1"
              color="blue darken-1"
              text
              @click="joinRoom(searchedId, searchedRoomPassword)"
            >Join</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- ユーザーが参加済みのルームを表示する -->
      <v-list-item
        v-for="{roomName, roomId} in myRooms"
        :key="roomId"
        :to="{ name: 'room', params: {roomId: roomId} }"
        @click="changeRoomAndFetchMessages(roomName, roomId)"
      >
        <v-list-item-icon>
          <v-icon>mdi-account-group</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ roomName }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <template v-slot:append>
      <div v-if="uid" class="align-center pa-2">
        <v-btn class="mb-2" @click="exitRoom" block :disabled="routeName === 'home'">現在のルームから退出</v-btn>
        <v-btn @click="doLogout" color="error" block>ログアウト</v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import AppModule from "../store/modules/app";

@Component
export default class SideNav extends Vue {
  routeName: "home" | "room" = "home";
  newDialog: boolean = false;
  showMakeRoomPassword: boolean = false;
  joinDialog: boolean = false;
  showJoinRoomPassword: boolean = false;
  newRoomName: string = ""; // 新規作成するルームの名前
  newRoomId: string = ""; // 新規作成するルームのID
  newRoomPassword: string = ""; // 新規作成するルームのパスワード
  searchedId: string = ""; // ルーム参加フォームに入力したID
  searchedRoomPassword: string = ""; // ルーム参加フォームに入力したパスワード

  @Watch("$route")
  changeRoute(to: any) {
    this.routeName = to.name;
  }

  get drawer(): boolean {
    return AppModule.drawer;
  }

  set drawer(value) {
    AppModule.setToggleSideMenuAction(value);
  }

  get uid(): string {
    return AppModule.uid;
  }

  get photoURL(): string | null {
    return AppModule.photoURL;
  }

  get displayName(): string | null {
    return AppModule.displayName;
  }

  get myRooms(): { roomName: string; roomId: string }[] {
    return AppModule.myRooms;
  }

  get isExitRoomDisabled(): boolean {
    return this.$router.currentRoute.name === "home";
  }

  makeNewRoom(newRoomName: string, newRoomId: string, newRoomPassword: string) {
    AppModule.makeNewRoomAction({ newRoomName, newRoomId, newRoomPassword });
    this.newRoomName = "";
    this.newRoomId = "";
    this.newRoomPassword = "";
  }

  joinRoom(searchedId: string, searchedRoomPassword: string) {
    AppModule.joinRoomAction({ searchedId, searchedRoomPassword });
    this.searchedId = "";
    this.searchedRoomPassword = "";
  }

  changeRoomAndFetchMessages(roomName: string, roomId: string) {
    AppModule.changeRoomAndFetchMessagesAction({roomName, roomId});
  }

  exitRoom() {
    AppModule.exitRoomAction();
  }

  doLogout() {
    AppModule.doLogoutAction();
  }
}
</script>

<style lang="scss" scoped>
.item {
  height: 60px;
}
</style>
