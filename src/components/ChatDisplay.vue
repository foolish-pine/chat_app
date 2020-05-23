<template>
    <v-content>
      <v-container>
        <div v-for="{ id, name, image, message, posttime, uid } in $store.state.messages" :key="id">
          <div v-if="(uid === $store.state.user.uid)" class="d-flex justify-end mb-4 ml-auto">
            <div class="chat-message">
              <div class="body-2 text-end">{{ name }}</div>
              <div class="d-flex align-end justify-end">
                <div class="caption mr-2">{{ posttime }}</div>
                <v-card outlined color="#f0ffe0" class="body-1 px-2 py-1">
                  <nl2br tag="div" :text="message" />
                </v-card>
              </div>
            </div>
            <v-avatar size="40" class="mt-1 ml-2">
              <img :src="image" width="40" height="40" />
            </v-avatar>
          </div>
          <div v-else class="d-flex mb-4">
            <v-avatar size="40" class="mt-1 mr-2">
              <img :src="image" width="40" height="40" />
            </v-avatar>
            <div class="chat-message">
              <div class="body-2">{{ name }}</div>
              <div class="d-flex align-end">
                <v-card outlined color="#f0ffe0" class="body-1 px-2 py-1">
                  <nl2br tag="div" :text="message" />
                </v-card>
                <div class="caption ml-2">{{ posttime }}</div>
              </div>
            </div>
          </div>
        </div>
      </v-container>
    </v-content>
</template>

<script>
// 改行を <br> タグに変換するモジュール
import Nl2br from "vue-nl2br";
export default {
  name: "ChatDisplay",
  components: { Nl2br },
  data() {
    return {
    };
  },
  methods: {
  },
  updated() {
    this.$nextTick(() => {
      window.scrollTo(0, document.body.clientHeight);
    });
  },
};
</script>

<style lang="scss" scoped>
.chat-message {
  max-width: 66% !important;
  width: 100% !important;
}
</style>