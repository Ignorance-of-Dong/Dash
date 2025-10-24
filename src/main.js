/*
 * @Author: zhangzheng
 * @Date: 2025-09-25 18:42:22
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-13 16:38:28
 * @Description:
 */
import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import { createPinia } from "pinia";
import { setupCustomComponent } from "./components/dashboard/cursorComponent";
const pinia = createPinia();
const app = createApp(App);
setupCustomComponent(app);
app.use(pinia).use(ElementPlus).mount("#app");
