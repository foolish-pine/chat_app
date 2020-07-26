<template>
  <v-app-bar app dark color="#41b883" height="80">
    <!-- ログイン時にサイドバーアイコンと現在のルーム名を表示 -->
    <template v-if="uid">
      <v-app-bar-nav-icon @click.stop="toggleSideMenu"></v-app-bar-nav-icon>
      <v-toolbar-title
        class="title"
      >{{ currentRoomName }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-avatar size="50" class="mr-3">
        <img v-if="photoURL" :src="photoURL" />
        <img v-else src="../assets/anonymous-avatar.png" />
      </v-avatar>
    </template>
  </v-app-bar>
</template>

  <script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AppModule from "../store/modules/app";

@Component
export default class HeaderItem extends Vue {
  get uid(): string {
    return AppModule.uid;
  }

  get photoURL(): string | null {
    return AppModule.photoURL;
  }

  get currentRoomName(): string {
    return AppModule.currentRoomName;
  }

  toggleSideMenu() {
    AppModule.toggleSideMenuAction();
  }
}
</script>