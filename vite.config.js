/*
 * @Author: zhangzheng
 * @Date: 2025-09-25 18:42:22
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-09-25 18:43:52
 * @Description:
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 4000,
  },
});
