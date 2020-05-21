import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from "../views/Home.vue";
import Chat from "../views/Chat.vue";


Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: Home
  },
  {
    path: "/rooms/:room_id?",
    name: "room",
    component: Chat
  }
];


Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
