<template>
  <v-navigation-drawer v-model="drawer" fixed temporary>
    <v-list>
      <v-list-item>
        <v-list-item-avatar>
          <img :src="photoURL" />
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ displayName }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

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
                  <v-text-field label="Room Name" v-model="roomName" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Room ID" v-model="roomId" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    label="Room Password"
                    v-model="roomPassword"
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
            <v-btn color="blue darken-1" text @click="newRoom(roomName, roomId, roomPassword)">Make</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
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
              @click="joinRoom(searchedId, searchedRoomPassword)"
            >Join</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-list-item
        v-for="{roomName, roomId} in $store.state.myRooms"
        :key="roomId"
        :to="{ name: 'room', params: {roomId: roomId} }"
        @click="changeRoom(roomId)"
      >
        <v-list-item-icon>
          <v-icon>mdi-account-group</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ roomName }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import store from "../store";
import firebase from "firebase";
export default {
  data() {
    return {
      newDialog: false,
      joinDialog: false,
      roomName: "",
      roomId: "",
      roomPassword: "",
      searchedId: "",
      searchedRoomPassword: ""
    };
  },
  methods: {
    ...mapActions(["changeRoomAndFetchMessages", "fetchMyRooms", "joinRoom"]),
    changeRoom(roomId) {
      this.changeRoomAndFetchMessages(roomId);
    },
    joinRoom(searchedId, searchedRoomPassword) {
      firebase
        .firestore()
        .collection(`rooms`)
        .onSnapshot(snapshot => {
          snapshot.forEach(doc => {
            if (
              doc.get("roomId") === searchedId &&
              doc.get("roomPassword") === searchedRoomPassword
            ) {
              firebase
                .firestore()
                .collection(`users/${this.uid}/myRooms`)
                .doc(searchedId)
                .set({
                  roomName: doc.get("roomName"),
                  roomId: doc.get("roomId")
                })
                .then(() => this.fetchMyRooms);
              this.$router.push({
                name: "room",
                params: { roomId: searchedId }
              });
            }
          });
        });
      this.changeRoomAndFetchMessages(searchedId);
      this.joinDialog = false;

      this.searchedId = "";
      this.searchedRoomPassword = "";
    },

    newRoom(roomName, roomId, roomPassword) {
      firebase
        .firestore()
        .collection(`rooms`)
        .doc(roomId)
        .set({
          roomName: roomName,
          roomId: roomId,
          roomPassword: roomPassword,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
        .then(() => {
          this.changeRoomAndFetchMessages(roomId);
          this.$router.push({
            name: "room",
            params: { roomId: roomId }
          });
        });
      firebase
        .firestore()
        .collection(`users/${this.uid}/myRooms`)
        .doc(roomId)
        .set({
          roomName: roomName,
          roomId: roomId
        })
        .then(() => this.fetchMyRooms);
      this.newDialog = false;
      this.roomName = "";
      this.roomId = "";
      this.roomPassword = "";
    }
  },
  computed: {
    ...mapGetters(["photoURL", "displayName", "uid"]),
    drawer: {
      get() {
        return store.state.drawer;
      },
      set(val) {
        store.commit("setDrawer"), val;
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  height: 60px;
}
</style>
