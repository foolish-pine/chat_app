<template>
  <v-navigation-drawer v-model="$store.state.drawer" fixed temporary>
    <v-list>
      <v-list-item>
        <v-list-item-avatar>
          <!-- ユーザーのアバターを表示 -->
          <img v-if="photoURL" :src="photoURL" />
          <img
            v-if="$store.state.user.isAnonymous"
            src="https://lh3.googleusercontent.com/ogw/ADGmqu95-Y5rL3aQFoJyII44uS-7RKoRDenRcWEqEfQM=s64-c-mo"
          />
        </v-list-item-avatar>
        <v-list-item-content>
          <!-- ユーザー名を表示 -->
          <v-list-item-title v-if="$store.state.user.isAnonymous">ゲストさん</v-list-item-title>
          <v-list-item-title v-if="displayName">{{ displayName }}</v-list-item-title>
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
        <v-card>
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
                    type="password"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="newDialog = false">Close</v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="makeAndJoinNewRoom(newRoomName, newRoomId, newRoomPassword)"
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
        <v-card>
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
                    v-model="searchedRoomPassword"
                    type="password"
                    required
                  ></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="joinDialog = false">Close</v-btn>
            <v-btn
              color="blue darken-1"
              text
              @click="searchAndJoinRoom(searchedId, searchedRoomPassword)"
            >Join</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- ユーザーが参加済みのルームを表示する -->
      <v-list-item
        v-for="{roomName, roomId} in $store.state.myRooms"
        :key="roomId"
        :to="{ name: 'room', params: {roomId: roomId} }"
        @click="changeRoomAndFetchMessages(roomId)"
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
        <v-btn @click="exitRoom" block class="mb-2">現在のルームから退出</v-btn>
        <v-btn @click="doLogout" block color="error">ログアウト</v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapGetters } from "vuex";
export default {
  data() {
    return {
      newDialog: false,
      joinDialog: false,
      newRoomName: "", // 新規作成するルームの名前
      newRoomId: "", // 新規作成するルームのID
      newRoomPassword: "", // 新規作成するルームのパスワード
      searchedId: "", // ルーム参加フォームに入力したID
      searchedRoomPassword: "" // ルーム参加フォームに入力したパスワード
    };
  },
  methods: {
    ...mapActions(["doLogout","exitRoom", "makeNewRoom", "joinRoom", "changeRoomAndFetchMessages"]),
    makeAndJoinNewRoom(newRoomName, newRoomId, newRoomPassword) {
      this.makeNewRoom({ newRoomName, newRoomId, newRoomPassword });
      this.newDialog = false;
      this.roomName = "";
      this.roomId = "";
      this.roomPassword = "";
    },
    searchAndJoinRoom(searchedId, searchedRoomPassword) {
      this.joinRoom({ searchedId, searchedRoomPassword });
      this.joinDialog = false;
      this.searchedId = "";
      this.searchedRoomPassword = "";
    }
  },
  computed: {
    ...mapGetters(["photoURL", "displayName", "uid"])
  }
};
</script>

<style lang="scss" scoped>
.item {
  height: 60px;
}
</style>
