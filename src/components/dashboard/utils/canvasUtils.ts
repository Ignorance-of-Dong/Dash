/*
 * @Author: zhangzheng
 * @Date: 2025-10-13 16:29:32
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-13 16:41:48
 * @Description:
 */

import { clone } from "ramda";
import { componentList } from "../cursorComponent/config";
export function findDragComponent(componentName) {
  let newComponent;
  componentList.forEach((comp) => {
    if (comp.component === componentName) {
      newComponent = clone(comp);
    }
  });
  return newComponent;
}
