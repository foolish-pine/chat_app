<!--Firebase から取得したリストを描画（トランジション付き）-->
<template>
  <div>
    <ChatDisplay></ChatDisplay>
    <ChatForm></ChatForm>
  </div>
</template>

<script>
import ChatDisplay from "../components/ChatDisplay.vue";
import ChatForm from "../components/ChatForm.vue";
export default {
  components: { ChatDisplay, ChatForm },
};
</script>
