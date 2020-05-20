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

      
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapGetters } from "vuex";
import store from "../store";
export default {
  data() {
    return {};
  },
  computed: {
    ...mapGetters(["photoURL", "displayName"]),
    drawer: {
      get () { return store.state.drawer },
      set (val) { store.commit('setDrawer'), val }
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  height: 60px;
}
</style>
