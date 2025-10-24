/*
 * @Author: zhangzheng
 * @Date: 2025-10-13 16:32:08
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-14 17:54:33
 * @Description:
 */
import type { App } from "vue";
import TestRect from "./components/TestRect.vue";

import { componentList } from "./config";

export const setupCustomComponent = (app: App<Element>) => {
  app.component("TestRect", TestRect);
};
