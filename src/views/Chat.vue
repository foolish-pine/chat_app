<!--Firebase から取得したリストを描画（トランジション付き）-->
<template>
  <div>
    <v-content>
      <v-container class="container">
        <div v-for="{ key, name, image, message, time, chatUid } in chat" :key="key">
          <div v-if="(uid === chatUid)" class="d-flex justify-end mb-4 ml-auto chat-item">
            <div>
              <div class="body-2 text-end">{{ name }}</div>
              <div class="d-flex align-end">
                <div class="caption mr-2">{{ time }}</div>
                <v-card outlined color="#f0ffe0" class="body-1 px-2 py-1 message">
                  <nl2br tag="div" :text="message" />
                </v-card>
              </div>
            </div>
            <v-avatar size="40" class="mt-1 ml-3">
              <img :src="image" width="40" height="40" />
            </v-avatar>
          </div>
          <div v-else class="d-flex mb-4 chat-item">
            <v-avatar size="40" class="mt-1 mr-4">
              <img :src="image" width="40" height="40" />
            </v-avatar>
            <div>
              <div class="body-2">{{ name }}</div>
              <div class="d-flex align-end">
                <v-card outlined color="#f0ffe0" class="body-1 px-2 py-1">
                  <nl2br tag="div" :text="message" />
                </v-card>
                <div class="caption ml-2">{{ time }}</div>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-content>
    <v-footer app color="#f5f5f5" height="120">
      <v-spacer></v-spacer>
      <!-- 入力フォーム -->
      <v-form action @submit.prevent="doSend" class="d-flex align-center container">
        <v-textarea
          :value="input"
          @input="onInput"
          :disabled="!uid"
          @keydown.shift.enter.exact.prevent="doSend"
          class="mr-2"
          outlined
          no-resize
          rows="2"
          background-color="white"
        ></v-textarea>
        <v-btn type="submit" :disabled="!uid" dark color="#41b883">送信</v-btn>
      </v-form>
      <v-spacer></v-spacer>
    </v-footer>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
// 改行を <br> タグに変換するモジュール
import Nl2br from "vue-nl2br";
export default {
  components: { Nl2br },
  data() {
    return {};
  },
  methods: {
    ...mapActions([
      "setLoginUser",
      "doLogin",
      "doLogout",
      "clearChat",
      "doUpdateInput",
      "doSend"
    ]),
    onInput(value) {
      this.doUpdateInput({ input: value });
    }
  },
  updated() {
    this.$nextTick(() => {
      window.scrollTo(0, document.body.clientHeight);
    });
  },
  computed: {
    ...mapGetters(["uid", "photoURL", "input", "chat"])
  }
};
</script>

<style lang="scss">
.container {
  max-width: 700px !important;
  width: 100% !important;
}
.chat-item {
  max-width: 75%;
  width: 100%;
}
textarea {
  overflow: hidden;
}
</style>