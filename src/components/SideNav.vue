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

      <v-list-item :to="{name: 'home'}">
        <v-list-item-icon>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>New Room</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-list-item v-for="{name, id, room_id} in $store.state.rooms" :key="id" :to="{ name: 'room', params: {room_id: room_id} }" @click="change(id)">
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
      dialog: false,
      items: [
        { name: 'Room 1', link: { name: 'room', params: {room_id: '1'} }, id: 1},
        { name: 'Room 2', link: { name: 'room', params: {room_id: '2'} }, id: 2 },
        { name: 'Room 3', link: { name: 'room', params: {room_id: '3'} }, id: 3 }
      ]
    };
  },
  methods: {
    ...mapActions(["changeRoomId"]),
    change(roomid) {
      this.changeRoomId(roomid)
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
