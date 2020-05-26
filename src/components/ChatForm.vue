<template>
  <v-footer app color="#f5f5f5" height="120">
    <v-spacer></v-spacer>
    <v-form action @submit.prevent="doSend" class="d-flex align-center form-container">
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
</template>

<script>
import { mapActions } from "vuex";
import { mapGetters } from "vuex";
export default {
  name: "ChatForm",
  data() {
    return {
    };
  },
  created () {
  },
  methods: {
    ...mapActions(["doUpdateInput", "doSend"]),
    onInput(input) {
      this.doUpdateInput(input);
    },
  },
  computed: {
    ...mapGetters(["uid", "input"])
  }
};
</script>

<style lang="scss" scoped>
.form-container {
  max-width: 700px !important;
  width: 100% !important;
}
</style>