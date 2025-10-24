/*
 * @Author: zhangzheng
 * @Date: 2025-09-30 15:32:23
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-09-30 17:05:40
 * @Description:
 */
import mitt from "mitt";
import { onBeforeUnmount } from "vue";

interface Option {
  name: string; // 事件名称
  callback: () => void; // 回调
}

const emitter = mitt();

export const useEmitt = (option?: Option) => {
  console.log("useEmitt", option);
  if (option) {
    emitter.on(option.name, option.callback);

    onBeforeUnmount(() => {
      emitter.off(option.name, option.callback);
    });
  }

  return {
    emitter,
  };
};
