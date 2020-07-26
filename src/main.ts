import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import * as firebase from "firebase/app";
import vuetify from "./plugins/vuetify";

Vue.config.productionTip = false;

const firebaseConfig = {
  apiKey: "AIzaSyAhHezS15Tqh7cHjbKQJmGvuZiHVwIoqcA",
  authDomain: "chat-app-e38c9.firebaseapp.com",
  databaseURL: "https://chat-app-e38c9.firebaseio.com",
  projectId: "chat-app-e38c9",
  storageBucket: "chat-app-e38c9.appspot.com",
  messagingSenderId: "886733415894",
  appId: "1:886733415894:web:aecd189c5cac029cd7f077",
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

new Vue({
  store,
  router,
  vuetify,
  render: (h) => h(App),
}).$mount("#app");
