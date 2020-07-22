<template>
  <v-content>
    <v-container>
      <div v-for="[key, value] in messages" :key="key">
        <div class="text-center my-5">{{ key }}</div>
        <!-- 現在のルームのメッセージを表示する -->
        <div v-for="{ id, name, image, message, posttime, uid } in value" :key="id">
          <!-- メッセージの発信者が自分ならメッセージを右側に表示する -->
          <div v-if="(uid === loginUserUid)" class="d-flex justify-end mb-5 ml-auto">
            <div class="chat-message">
              <div v-if="name !== null" class="body-2 text-end">{{ name }}</div>
              <div v-else class="body-2 text-end">ゲストさん</div>
              <div class="d-flex align-end justify-end">
                <div class="caption mr-2">{{ posttime }}</div>
                <v-card
                  outlined
                  color="light-green lighten-4"
                  class="body-1 px-2 py-1"
                  style="white-space:pre"
                >{{message}}</v-card>
              </div>
            </div>
            <v-avatar size="50" class="mt-1 ml-2">
              <img v-if="image !== null" :src="image" />
              <img v-else src="../assets/anonymous-avatar.png" />
            </v-avatar>
          </div>
          <!-- メッセージの発信者が自分以外のメッセージを左側に表示する -->
          <div v-else class="d-flex mb-5">
            <v-avatar size="50" class="mt-1 mr-2">
              <img v-if="image !== null" :src="image" />
              <img v-else src="../assets/anonymous-avatar.png" />
            </v-avatar>
            <div class="chat-message">
              <div v-if="name !== null" class="body-2">{{ name }}</div>
              <div v-else class="body-2">ゲストさん</div>
              <div class="d-flex align-end">
                <v-card
                  outlined
                  color="grey lighten-3"
                  class="body-1 px-2 py-1"
                  style="white-space:pre"
                >{{message}}</v-card>
                <div class="caption ml-2">{{ posttime }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-container>
  </v-content>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AppModule from "../store/modules/app";
// eslint-disable-next-line no-unused-vars
import { FetchedMessage } from "../store/modules/types";

@Component
export default class ChatDisplay extends Vue {
  get loginUserUid(): string {
    return AppModule.uid;
  }

  get messages(): [string, FetchedMessage[]][] {
    return Array.from(AppModule.messages);
  }

  updated() {
    this.$nextTick(() => {
      window.scrollTo(0, document.body.clientHeight);
    });
  }
}
</script>

<style lang="scss" scoped>
.chat-message {
  max-width: 66% !important;
  width: 100% !important;
}
</style>