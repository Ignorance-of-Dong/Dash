/*
 * @Author: zhangzheng
 * @Date: 2025-09-25 18:51:57
 * @LastEditors: zhangzheng
 * @LastEditTime: 2025-10-21 18:53:52
 * @Description:
 */
import {
  DEFAULT_COLOR_CASE_DARK,
  DEFAULT_COLOR_CASE_LIGHT,
  DEFAULT_TITLE_STYLE_DARK,
  DEFAULT_TITLE_STYLE_LIGHT,
  FILTER_COMMON_STYLE_DARK,
  FILTER_COMMON_STYLE_LIGHT,
  SENIOR_STYLE_SETTING_DARK,
  SENIOR_STYLE_SETTING_LIGHT,
  TAB_COMMON_STYLE_DARK,
  TAB_COMMON_STYLE_LIGHT,
} from "./chart";

export const DEFAULT_CANVAS_STYLE_DATA_BASE = {
  width: 1920,
  height: 1080,
  refreshBrowserEnable: false, // 开启浏览器刷新（默认关闭）
  refreshBrowserUnit: "minute", // 仪表板刷新时间带外 默认 分钟
  refreshBrowserTime: 5, // 仪表板刷新时间 默认5分钟
  refreshViewEnable: false, // 开启图表刷新（默认关闭）
  refreshViewLoading: true, // 仪表板图表loading提示
  refreshUnit: "minute", // 仪表板刷新时间带外 默认 分钟
  refreshTime: 5, // 仪表板刷新时间 默认5分钟
  popupAvailable: true, // 弹窗区域是否可用 默认为true
  popupButtonAvailable: true, // 弹框区域显示按钮是否可用 默认为true
  suspensionButtonAvailable: false, // 悬浮按钮是否可用 默认false
  screenAdaptor: "widthFirst", // 屏幕适配方式 widthFirst=宽度优先 heightFirst=高度优先 full=铺满全屏 keepSize=不缩放
  dashboardAdaptor: "keepHeightAndWidth", //仪表板预览展示适配方式 keepHeightAndWidth=高度宽度独立缩放(默认模式)，withWidth=跟随宽度
  scale: 60,
  scaleWidth: 60,
  scaleHeight: 60,
  backgroundColorSelect: true,
  backgroundImageEnable: false,
  backgroundType: "backgroundColor", // 废弃
  background: "",
  openCommonStyle: true,
  fontSize: 14,
  fontFamily: "PingFang", //字体设置 默认PingFang
};
export const MOBILE_SETTING_BASE = {
  customSetting: false,
  imageUrl: null,
  backgroundType: "image",
};
export const DEFAULT_DASHBOARD_STYLE_BASE = {
  gap: "yes",
  gapSize: 5,
  gapMode: "middle",
  showGrid: false,
  matrixBase: 4, // 当前matrix的基数 （是pcMatrixCount的几倍）
  resultMode: "all", // 图表结果显示模式 all 图表 custom 仪表板自定义
  resultCount: 1000, // 图表结果显示条数
};

export const MOBILE_SETTING_DARK = {
  ...MOBILE_SETTING_BASE,
  color: "#fff",
};

export const DEFAULT_DASHBOARD_STYLE_DARK = {
  ...DEFAULT_DASHBOARD_STYLE_BASE,
  themeColor: "dark",
  mobileSetting: MOBILE_SETTING_DARK,
};

export const COMMON_COMPONENT_BACKGROUND_BASE = {
  backgroundColorSelect: true,
  backdropFilterEnable: false,
  backgroundImageEnable: false,
  backgroundType: "innerImage",
  innerImage: "board/board_1.svg",
  outerImage: null,
  innerPadding: 12,
  borderRadius: 0,
  backdropFilter: 4,
};

export const COMMON_COMPONENT_BACKGROUND_DARK = {
  ...COMMON_COMPONENT_BACKGROUND_BASE,
  backgroundColor: "rgba(19,28,66,1)",
  innerImageColor: "#1094E5",
};

export const PANEL_CHART_INFO_DARK = {
  chartTitle: DEFAULT_TITLE_STYLE_DARK,
  chartColor: DEFAULT_COLOR_CASE_DARK,
  chartCommonStyle: COMMON_COMPONENT_BACKGROUND_DARK,
  filterStyle: FILTER_COMMON_STYLE_DARK,
  tabStyle: TAB_COMMON_STYLE_DARK,
  seniorStyleSetting: SENIOR_STYLE_SETTING_DARK,
};

// 基础暗色主题
export const DEFAULT_CANVAS_STYLE_DATA_DARK = {
  ...DEFAULT_CANVAS_STYLE_DATA_BASE,
  // 页面全局数据
  themeId: "10002",
  color: "#fff",
  backgroundColor: "#020408",
  dashboard: DEFAULT_DASHBOARD_STYLE_DARK,
  component: PANEL_CHART_INFO_DARK,
};

// 沙盘编辑器默认配色
export const SANDBOX_EDITOR_DEFAULT_COLOR = "#f5f6f7";

export const SANDBOX_EDITOR_DEFAULT_PREVIEW_AREA_ITEM = [
  {
    id: "left",
    width: 300,
    height: "auto",
    backgroundColor: "#006bff26",
    top: 0,
    left: 0,
  },
  {
    id: "right",
    width: 300,
    height: "auto",
    backgroundColor: "#006bff26",
    top: 0,
    right: 0,
  },
  {
    id: "bottom",
    width: "calc",
    height: 100,
    backgroundColor: "#006bff26",
    bottom: 0,
    left: 300,
    right: 300,
  },
];
