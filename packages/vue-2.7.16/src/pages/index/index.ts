import Vue from "vue";
import App from "./App.vue";
import "./index.css";

new Vue({
  el: "#" + import.meta.env.MOUNT_ID,
  render: (h) => h(App),
});
