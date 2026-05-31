import Vue from "vue";
import App from "./App.vue";
import "./index.css";

const el = document.getElementById(import.meta.env.MOUNT_ID);
if (el) {
  new Vue({
    el,
    render: (h) => h(App),
  });
}
