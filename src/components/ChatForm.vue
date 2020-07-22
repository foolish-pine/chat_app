<template>
  <v-footer app color="grey lighten-3" height="150">
    <v-spacer></v-spacer>

    <v-form @submit.prevent="doSend" class="d-flex align-center form-container">
      <v-textarea
        v-model="input"
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
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import AppModule from "../store/modules/app";

@Component
export default class ChatForm extends Vue {
  input: string = "";

  get uid(): string {
    return AppModule.uid;
  }

  doSend() {
    AppModule.doSendAction(this.input);
    this.input = "";
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  max-width: 700px !important;
  width: 100% !important;
}
</style>