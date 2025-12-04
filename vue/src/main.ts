import { createApp } from "vue";
import App from "./App.vue";
import { ClickOutside } from "element-plus";
import component from "@/components/index";
import VueLazyLoad from 'vue3-lazyload'
import "@/styles/light/css-vars.css";
import "@/styles/dark/css-vars.css";
import "@/styles/element/custom.css";

const app = createApp(App);
app.directive("clickoutside", ClickOutside);
app.use(component);
app.use(VueLazyLoad, {
	// options
});
app.mount("#app");
