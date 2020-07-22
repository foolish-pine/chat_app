<!--Firebase から取得したリストを描画（トランジション付き）-->
<template>
  <div>
    <ChatDisplay></ChatDisplay>
    <ChatForm></ChatForm>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ChatDisplay from "../components/ChatDisplay.vue";
import ChatForm from "../components/ChatForm.vue";

@Component({
  components: {
    ChatDisplay,
    ChatForm
  }
})
export default class Chat extends Vue {}
</script>
