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

      <v-dialog v-model="dialog" max-width="600px">
        <template v-slot:activator="{ on }">
          <v-list-item v-on="on">
            <v-list-item-icon>
              <v-icon>mdi-plus</v-icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-list-item-title>New Talk Room</v-list-item-title>
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
                  <v-text-field label="Room Name" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Room ID" required></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field label="Password" type="password" required></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
            <v-btn color="blue darken-1" text @click="dialog = false">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="dialog" max-width="600px">
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
                  <v-text-field label="Room ID" required></v-text-field>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Close</v-btn>
            <v-btn color="blue darken-1" text @click="changeRoom(id)">Join</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-list-item
        v-for="{name, roomId} in $store.state.myRooms"
        :key="roomId"
        :to="{ name: 'room', params: {roomId: roomId} }"
        @click="changeRoom(roomId)"
      >
        <v-list-item-icon>
          <v-icon>mdi-account-group</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ name }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
import store from "../store";
export default {
  data() {
    return {
      dialog: false
    };
  },
  methods: {
    ...mapActions(["joinRoom", "changeRoomAndFetchMessages"]),
    changeRoom(roomId) {
      this.changeRoomAndFetchMessages(roomId)
    }
  },
  computed: {
    ...mapGetters(["photoURL", "displayName"]),
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
